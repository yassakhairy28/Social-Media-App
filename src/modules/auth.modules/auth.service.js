import userModel, { providers, roleType } from "../../DB/models/user.model.js";
import * as dbServices from "../../DB/DBservices.js";
import { compare, hash } from "./../../utils/hashing/hash.js";
import { encrypt } from "./../../utils/encryption/encryption.js";
import { emailEmitter } from "../../utils/email/emailEvent.js";
import { generateToken } from "../../utils/token/token.js";
import { subject } from "../../utils/email/sendEmail.js";
import { OAuth2Client } from "google-auth-library";
import {
  decodedToken,
  generateAuthTokens,
  tokenTypes,
} from "../../middlewares/auth.meddleware.js";
import jwt from "jsonwebtoken";
export const register = async (req, res, next) => {
  const { userName, email, password, phone, role, gender } = req.body;

  const checkUser = await dbServices.findOne({
    model: userModel,
    data: { email },
  });
  if (checkUser) return next(new Error("User Already Exist", { cause: 409 }));

  const encryptPhone = encrypt({
    payload: phone,
    segnature: process.env.SECRETKEY_PHONE,
  });

  emailEmitter.emit("sendEmail", email, userName, subject.register);

  const user = await dbServices.create({
    model: userModel,
    data: {
      userName,
      email,
      password,
      phone: encryptPhone,
      role,
      gender,
      countOfSentCode: 0,
      lastSentCount: 0,
    },
  });

  return res
    .status(201)
    .json({ success: true, message: "User Created Successfully", user });
};

export const activaieAccount = async (req, res, next) => {
  const { email, code } = req.body;

  const checkUser = await dbServices.findOne({
    model: userModel,
    data: { email },
  });
  if (!checkUser) return next(new Error("User Not Found", { cause: 404 }));

  const checkCode = compare({ plainText: code, hash: checkUser.code });
  if (!checkCode) return next(new Error("Invalid Code", { cause: 400 }));

  if (checkUser.codeExpireAt <= Date.now())
    return next(new Error("Code Expired", { cause: 400 }));

  if (checkUser.confirmEmail == true)
    return next(new Error("Email Already Activated", { cause: 409 }));

  checkUser.confirmEmail = true;
  checkUser.code = "";
  checkUser.countOfSentCode = null;
  checkUser.lastSentCount = null;
  await checkUser.save();
  return res.status(200).json({ success: true, message: "Account Activated" });
};

export const login = async (req, res, next) => {
  const { email, password } = req.body;

  const user = await dbServices.findOne({ model: userModel, data: { email } });
  if (!user)
    return next(new Error("in-valid username or Password", { cause: 404 }));

  if (!user.confirmEmail)
    return next(new Error("Please activate your email first.", { cause: 409 }));

  const checkPassword = compare({ plainText: password, hash: user.password });

  if (!checkPassword)
    return next(new Error("in-valid username or Password", { cause: 400 }));

  emailEmitter.emit("sendEmail", user.email, user.userName, subject.login);
  user.countOfSentCode = 0;
  await user.save();
  return res.status(200).json({
    success: true,
    message:
      "To complete your login, please enter the code sent to your email.",
  });
};

export const loginOTP = async (req, res, next) => {
  const { email, code } = req.body;

  const user = await dbServices.findOne({ model: userModel, data: { email } });
  if (!user) return next(new Error("user not found", { cause: 404 }));

  const compareCode = compare({ plainText: code, hash: user.code });

  if (!compareCode) return next(new Error("in-valid code", { cause: 400 }));

  if (user.codeExpireAt <= Date.now())
    return next(new Error("Code Expired", { cause: 400 }));

  user.code = "";
  user.codeExpiredAt = "";
  user.countOfSentCode = null;
  user.lastSentCount = null;
  user.credentialsTime = Date.now();
  await user.save();
  //Tokens
  const { accessToken, refreshToken } = generateAuthTokens(user);

  return res
    .status(200)
    .json({ success: true, Tokens: { accessToken, refreshToken } });
};

export const refreshToken = async (req, res, next) => {
  const { authorization } = req.headers;
  const user = await decodedToken({
    authorization,
    tokenType: tokenTypes.Refresh,
    next,
  });
  await dbServices.findByIdAndUpdate({
    model: userModel,
    filter: user._id,
    data: { credentialsTime: Date.now() },
  });
  const { accessToken, refreshToken } = generateAuthTokens(user);

  return res
    .status(200)
    .json({ success: true, Tokens: { accessToken, refreshToken } });
};

export const loginWithGmail = async (req, res, next) => {
  const { idToken } = req.body;

  const client = new OAuth2Client();
  async function verify() {
    const ticket = await client.verifyIdToken({
      idToken,
      audience: process.env.CLIENT_ID,
    });
    const payload = ticket.getPayload();
    return payload;
  }
  const { email, name, picture, email_verified } = await verify();

  if (!email_verified)
    return next(new Error("please verify your email", { cause: 400 }));

  let user = await dbServices.findOne({ model: userModel, data: { email } });

  if (user?.providers === providers.System)
    return next(new Error("Email Already Exist", { cause: 409 }));

  if (!user) {
    user = await dbServices.create({
      model: userModel,
      data: {
        email,
        userName: name,
        image: picture,
        providers: providers.Google,
        confirmEmail: true,
      },
    });
  }

  //Tokens
  const accessToken = generateToken({
    payload: { id: user._id },
    signature:
      user.role === roleType.User
        ? process.env.ACCESS_TOKEN_USER
        : process.env.ACCESS_TOKEN_ADMIN,
    options: { expiresIn: process.env.ACCESS_TOKEN_EXPIRATION_TIME },
  });

  const refreshToken = generateToken({
    payload: { id: user._id },
    signature:
      user.role === roleType.User
        ? process.env.REFRESH_TOKEN_USER
        : process.env.REFRESH_TOKEN_ADMIN,
    options: { expiresIn: process.env.REFRESH_TOKEN_EXPIRATION_TIME },
  });

  return res
    .status(200)
    .json({ success: true, Tokens: { accessToken, refreshToken } });
};

export const forgetPassword = async (req, res, next) => {
  const { email } = req.body;

  const user = await dbServices.findOne({ model: userModel, data: { email } });
  if (!user) return next(new Error("user not found", { cause: 404 }));

  if (!user.confirmEmail)
    return next(new Error("Please activate your email first.", { cause: 409 }));

  emailEmitter.emit(
    "sendEmail",
    user.email,
    user.userName,
    subject.resetPassword
  );
  user.countOfSentCode = 0;
  await user.save();
  return res
    .status(200)
    .json({ success: true, message: "Code Sent Successfully" });
};

export const resetPassword = async (req, res, next) => {
  const { email, code, password } = req.body;

  const user = await dbServices.findOne({ model: userModel, data: { email } });
  if (!user) return next(new Error("user not found", { cause: 404 }));

  const checkCode = compare({ plainText: code, hash: user.code });
  if (!checkCode) return next(new Error("Invalid Code", { cause: 400 }));

  if (user.codeExpireAt <= Date.now())
    return next(new Error("Code Expired", { cause: 400 }));

  const hashPassword = hash({ plainText: password });
  user.password = hashPassword;
  user.code = undefined;
  user.codeExpireAt = undefined;
  user.countOfSentCode = null;
  user.lastSentCount = null;
  user.credentialsTime = Date.now() + 30 * 60 * 1000;
  await user.save();

  return res
    .status(200)
    .json({ success: true, message: "Password Reset Successfully" });
};

export const logout = async (req, res, next) => {
  req.user.credentialsTime = Date.now() + 30 * 60 * 1000;

  await req.user.save();

  return res
    .status(200)
    .json({ success: true, message: "Logout Successfully" });
};
