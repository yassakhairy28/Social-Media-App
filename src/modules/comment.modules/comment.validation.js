import joi from "joi";
import { generalFields } from "../../middlewares/validation.middleware.js";

export const createCommentSchema = joi
  .object({
    postId: generalFields.id.required(),
    text: generalFields.content,
    files: joi.array().items(generalFields.fileObject),
  })
  .or("text", "files");

export const updateCommentSchema = joi
  .object({
    postId: generalFields.id.required(),
    commentId: generalFields.id.required(),
    text: generalFields.content,
    files: joi.array().items(generalFields.fileObject),
  })
  .or("text", "files");

export const addReactionSchema = joi
  .object({
    postId: generalFields.id.required(),
    commentId: generalFields.id.required(),
    reaction: generalFields.reaction.required(),
  })
  .required();

export const softDeletedSchema = joi
  .object({
    postId: generalFields.id.required(),
    commentId: generalFields.id.required(),
  })
  .required();
export const restoreCommentSchema = joi
  .object({
    postId: generalFields.id.required(),
    commentId: generalFields.id.required(),
  })
  .required();

export const replyCommentSchema = joi
  .object({
    postId: generalFields.id.required(),
    commentId: generalFields.id.required(),
    text: generalFields.content,
    files: joi.array().items(generalFields.fileObject),
  })
  .or("text", "files");

export const getCommentSchema = joi
  .object({
    commentId: generalFields.id.required(),
  })
  .required();
export const deleteCommentSchema = joi
  .object({
    postId: generalFields.id.required(),
    commentId: generalFields.id.required(),
  })
  .required();
