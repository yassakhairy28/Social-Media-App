import { generateToken, verifyToken } from "../utils/token/token.js";
import asyncHandler from "./../utils/error handling/asyncHandler.js";
import userModel, { roleType } from "../DB/models/user.model.js";
import * as dbServices from "../DB/DBservices.js";

export const tokenTypes = {
  Access: "Access",
  Refresh: "Refresh",
};
export const decodedToken = async ({
  authorization = "",
  tokenType = tokenTypes.Access,
  next = {},
}) => {
  const [bearer, token] = authorization.split(" ") || [];

  if (!bearer || !token) return next(new Error("unauthorized", { cause: 401 }));

  let ACCESS_SIGNATURE = undefined;
  let REFRESH_SIGNATURE = undefined;

  switch (bearer) {
    case "User":
      ACCESS_SIGNATURE = process.env.ACCESS_TOKEN_USER;
      REFRESH_SIGNATURE = process.env.REFRESH_TOKEN_USER;
      break;
    case "Admin":
      ACCESS_SIGNATURE = process.env.ACCESS_TOKEN_ADMIN;
      REFRESH_SIGNATURE = process.env.REFRESH_TOKEN_ADMIN;
      break;
    default:
      break;
  }

  const decoded = verifyToken({
    token,
    signature:
      tokenType === tokenTypes.Access ? ACCESS_SIGNATURE : REFRESH_SIGNATURE,
  });

  const user = await dbServices.findById({
    model: userModel,
    id: decoded.id,
    select: { isDeleted: false },
  });

  if (!user) return next(new Error("user not found", { cause: 404 }));

  if (user.role !== bearer)
    return next(new Error("unauthorized", { cause: 401 }));

  if (user.isDeleted == true)
    return next(new Error("Please ReActivate Your Account", { cause: 401 }));

  if (user.credentialsTime?.getTime() >= decoded.exp * 1000)
    return next(new Error("please login again", { cause: 401 }));
  return user;
};

export const authentication = asyncHandler(async (req, res, next) => {
  const { authorization } = req.headers;
  req.user = await decodedToken({ authorization, next });

  return next();
});

export const generateAuthTokens = (user) => {
  return {
    accessToken: generateToken({
      payload: { id: user._id },
      signature:
        user.role === roleType.User
          ? process.env.ACCESS_TOKEN_USER
          : process.env.ACCESS_TOKEN_ADMIN,
      options: { expiresIn: process.env.ACCESS_TOKEN_EXPIRATION_TIME },
    }),
    refreshToken: generateToken({
      payload: { id: user._id },
      signature:
        user.role === roleType.User
          ? process.env.REFRESH_TOKEN_USER
          : process.env.REFRESH_TOKEN_ADMIN,
      options: { expiresIn: process.env.REFRESH_TOKEN_EXPIRATION_TIME },
    }),
  };
};

export const allowTo = (roles = []) => {
  return async (req, res, next) => {
    if (!roles.includes(req.user.role))
      return next(new Error("forbidden Acount", { cause: 403 }));
    return next();
  };
};
