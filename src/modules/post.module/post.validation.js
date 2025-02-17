import { generalFields } from "../../middlewares/validation.middleware.js";
import joi from "joi";

export const createPostSchema = joi
  .object({
    content: generalFields.content,
    files: joi.array().items(generalFields.fileObject),
  })
  .or("content", "files");

export const updatePostSchema = joi
  .object({
    postId: generalFields.id.required(),
    content: generalFields.content,
    files: joi.array().items(generalFields.fileObject),
  })
  .or("content", "files");

export const softDeleteSchema = joi.object({
  postId: generalFields.id.required(),
});

export const spacificPostSchema = joi.object({
  postId: generalFields.id.required(),
  page: generalFields.page,
});
export const addReactionSchema = joi.object({
  postId: generalFields.id.required(),
  reaction: generalFields.reaction.required(),
});
