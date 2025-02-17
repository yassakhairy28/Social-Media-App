import userModel, { roleType } from "../../DB/models/user.model.js";
import asyncHandler from "../../utils/error handling/asyncHandler.js";
import * as dbServices from "../../DB/DBservices.js";

export const changeRoleMiddleware = asyncHandler(async (req, res, next) => {
  const { userId } = req.params;

  let targetUser = await dbServices.findById({
    model: userModel,
    id: { _id: userId },
  });
  if (!targetUser) return next(new Error("user not found", { cause: 404 }));

  const roleHierarchy = new Map([
    [roleType.SuperAdmin, 3],
    [roleType.Admin, 2],
    [roleType.User, 1],
  ]);

  const reqUserLevel = roleHierarchy.get(req.user.role);
  const targetUserLevel = roleHierarchy.get(targetUser.role);

  if (reqUserLevel < targetUserLevel) {
    return next(new Error("unauthorized", { cause: 401 }));
  }

  return next();
});
