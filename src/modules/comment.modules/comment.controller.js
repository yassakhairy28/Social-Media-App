import { Router } from "express";
import * as validation from "./comment.validation.js";
import * as comment from "./comment.service.js";
import asyncHandler from "../../utils/error handling/asyncHandler.js";
import { validate } from "../../middlewares/validation.middleware.js";
import { authentication, allowTo } from "../../middlewares/auth.meddleware.js";
import { upload } from "../../utils/file uploading/fileUploading.js";
import { filesValidation } from "../../utils/file uploading/fileUploading.js";
import { filesFilter } from "../../utils/file uploading/fileUploading.js";

const commentRouter = Router({ mergeParams: true });

commentRouter.post(
  "/create",
  authentication,
  allowTo(["User"]),
  upload.array("images", 5),
  filesFilter(filesValidation.image),
  validate(validation.createCommentSchema),
  asyncHandler(comment.createComment)
);

commentRouter.patch(
  "/update/:commentId",
  authentication,
  allowTo(["User"]),
  upload.array("images", 5),
  filesFilter(filesValidation.image),
  validate(validation.updateCommentSchema),
  asyncHandler(comment.updateComment)
);

commentRouter.post(
  "/reaction/:commentId",
  authentication,
  allowTo(["User"]),
  validate(validation.addReactionSchema),
  asyncHandler(comment.reactionComment)
);

commentRouter.patch(
  "/freeze/:commentId",
  authentication,
  allowTo(["User", "Admin"]),
  validate(validation.softDeletedSchema),
  asyncHandler(comment.freezeComment)
);
commentRouter.patch(
  "/restore/:commentId",
  authentication,
  allowTo(["User", "Admin"]),
  validate(validation.restoreCommentSchema),
  asyncHandler(comment.restoreComment)
);
commentRouter.post(
  "/reply/:commentId",
  authentication,
  allowTo(["User"]),
  upload.array("images", 5),
  filesFilter(filesValidation.image),
  validate(validation.replyCommentSchema),
  asyncHandler(comment.replyComment)
);

commentRouter.get(
  "/get/:commentId",
  authentication,
  allowTo(["User", "Admin"]),
  validate(validation.getCommentSchema),
  asyncHandler(comment.getComment)
);
commentRouter.delete(
  "/delete/:commentId",
  authentication,
  allowTo(["User", "Admin"]),
  validate(validation.deleteCommentSchema),
  asyncHandler(comment.deleteComment)
);


export default commentRouter;
