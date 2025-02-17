import { Router } from "express";
import * as validation from "./post.validation.js";
import * as posts from "./post.service.js";
import asyncHandler from "../../utils/error handling/asyncHandler.js";
import { validate } from "../../middlewares/validation.middleware.js";
import { authentication, allowTo } from "../../middlewares/auth.meddleware.js";
import { upload } from "../../utils/file uploading/fileUploading.js";
import { filesValidation } from "../../utils/file uploading/fileUploading.js";
import { filesFilter } from "../../utils/file uploading/fileUploading.js";
import commentRouter from "../comment.modules/comment.controller.js";

const postRouter = Router();

postRouter.use("/:postId/comment", commentRouter);

postRouter.post(
  "/create",
  authentication,
  allowTo(["User"]),
  upload.array("images", 5),
  filesFilter(filesValidation.image),
  validate(validation.createPostSchema),
  asyncHandler(posts.createPost)
);

postRouter.patch(
  "/update/:postId",
  authentication,
  allowTo(["User"]),
  upload.array("images", 5),
  filesFilter(filesValidation.image),
  validate(validation.updatePostSchema),
  asyncHandler(posts.updatePost)
);

postRouter.post(
  "/soft_delete/:postId",
  authentication,
  allowTo(["User", "Admin"]),
  validate(validation.softDeleteSchema),
  asyncHandler(posts.softDelete)
);

postRouter.post(
  "/restore_post/:postId",
  authentication,
  allowTo(["User", "Admin"]),
  validate(validation.softDeleteSchema),
  asyncHandler(posts.restorePost)
);

postRouter.get(
  "/:postId",
  authentication,
  allowTo(["User", "Admin"]),
  validate(validation.spacificPostSchema),
  asyncHandler(posts.spacificPost)
);

postRouter.post(
  "/like/:postId",
  authentication,
  validate(validation.addReactionSchema),
  allowTo(["User"]),
  asyncHandler(posts.reactionPost)
);
postRouter.get("/", authentication, allowTo(["User", "Admin"]) , asyncHandler(posts.getPosts));

postRouter.delete(
  "/delete/:postId",
  authentication,
  allowTo(["Admin", "User"]),
  validate(validation.softDeleteSchema),
  asyncHandler(posts.deletePost)
);
export default postRouter;
