import { Router } from "express";
import * as user from "./user.service.js";
import * as userValidation from "./user.validation.js";
import { validate } from "../../middlewares/validation.middleware.js";
import asyncHandler from "../../utils/error handling/asyncHandler.js";
import { allowTo, authentication } from "../../middlewares/auth.meddleware.js";
import {
  filesFilter,
  upload,
  filesValidation,
} from "./../../utils/file uploading/fileUploading.js";
import { auth } from "google-auth-library";

const userRouter = Router();

userRouter.get(
  "/profile",
  authentication,
  allowTo(["User", "Admin"]),
  asyncHandler(user.getProfile)
);

userRouter.get(
  "/profile/:profileId",
  authentication,
  allowTo(["User", "Admin"]),
  validate(userValidation.viewProfileSchema),
  asyncHandler(user.viewProfile)
);

userRouter.get(
  "/search",
  authentication,
  allowTo(["User", "Admin"]),
  validate(userValidation.searchSchema),
  asyncHandler(user.search)
)
userRouter.patch(
  "/updateEmail",
  authentication,
  allowTo(["Admin", "User"]),
  validate(userValidation.updateEMailSchema),
  asyncHandler(user.updateEmail)
);

userRouter.patch(
  "/resetEmail",
  authentication,
  allowTo(["Admin", "User"]),
  validate(userValidation.resetEmailSchema),
  asyncHandler(user.resetEmail)
);

userRouter.patch(
  "/updatePassword",
  authentication,
  allowTo(["Admin", "User"]),
  validate(userValidation.updatePasswordSchema),
  asyncHandler(user.updatePassword)
);
userRouter.patch(
  "/updateProfile",
  authentication,
  allowTo(["Admin", "User"]),
  validate(userValidation.updateProfileSchema),
  asyncHandler(user.updateProfile)
);

userRouter.post(
  "/uploadImages",
  authentication,
  upload.array("images", 10),
  filesFilter(filesValidation.image),
  asyncHandler(user.uploadImages)
);

userRouter.post(
  "/uploadPictureInCloud",
  authentication,
  upload.single("image"),
  filesFilter(filesValidation.image),
  asyncHandler(user.uploadPictureInCloud)
);
userRouter.delete(
  "/deletePictureInCloud",
  authentication,
  asyncHandler(user.deletePictureInCloud)
);

export default userRouter;
