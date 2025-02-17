import { Router } from "express";
import * as admin from "./admin.service.js";
import * as adminValidation from "./admin.validation.js";
import asyncHandler from "../../utils/error handling/asyncHandler.js";
import { validate } from "../../middlewares/validation.middleware.js";
import { allowTo, authentication } from "../../middlewares/auth.meddleware.js";
import { changeRoleMiddleware } from "./admin.midddlerware.js";

const adminRouter = Router();

adminRouter.get(
  "/usersAndposts",
  authentication,
  allowTo(["Admin"]),
  asyncHandler(admin.getUsersAndPosts)
);

adminRouter.patch(
  "/changeRole/:userId",
  authentication,
  allowTo(["Admin"]),
  validate(adminValidation.changeRoleSchema),
  changeRoleMiddleware,
  asyncHandler(admin.changeRole)
);
export default adminRouter;
