import * as dbServices from "../../DB/DBservices.js";
import commentModel, { reactions } from "../../DB/models/comment.model.js";
import postModel from "../../DB/models/post.model.js";
import { roleType } from "../../DB/models/user.model.js";
import cloudinary from "../../utils/file uploading/cloudinaryConfig.js";

export const createComment = async (req, res, next) => {
  const { postId } = req.params;

  const post = await dbServices.findOne({
    model: postModel,
    data: { _id: postId, isDeleted: false },
  });

  if (!post) return next(new Error("Post Not Found", { casue: 404 }));

  const comment = await dbServices.create({
    model: commentModel,
    data: {
      text: req.body.text,
      postId,
      createdBy: req.user._id,
    },
  });

  if (req.files?.length) {
    const allImages = await post.uploadImages(req.files, {
      folder: `posts/${req.user._id}/posts/${post.customerId}/comments`,
    });
    comment.images = allImages;
    await comment.save();
  }

  return res.status(201).json({ success: true, comment });
};
export const updateComment = async (req, res, next) => {
  const { postId, commentId } = req.params;

  const post = await dbServices.findOne({
    model: postModel,
    data: { _id: postId, isDeleted: false },
  });

  if (!post) return next(new Error("Post Not Found", { casue: 404 }));

  const comment = await dbServices.findOne({
    model: commentModel,
    data: { _id: commentId, isDeleted: false },
  });

  if (!comment) return next(new Error("Comment Not Found", { casue: 404 }));

  let allImages;

  //delete images
  if (req.files?.length) {
    for (const file of comment.images) {
      await cloudinary.uploader.destroy(file.public_id);
    }
    allImages = await post.uploadImages(req.files, {
      folder: `posts/${req.user._id}/posts/${post.customerId}/comments`,
    });
  }

  comment.text = req.body.text;
  comment.images = allImages;
  await comment.save();

  return res.status(200).json({ success: true, comment });
};
export const reactionComment = async (req, res, next) => {
  const { postId } = req.params;
  const { commentId } = req.params;
  const { reaction } = req.body;

  const post = await dbServices.findOne({
    model: postModel,
    data: { _id: postId, isDeleted: false },
  });

  if (!post) return next(new Error("Post Not Found", { casue: 404 }));

  const comment = await dbServices.findOne({
    model: commentModel,
    data: { _id: commentId, isDeleted: false },
  });

  if (!comment) return next(new Error("Comment Not Found", { casue: 404 }));

  const isUserReaction = comment.reactions.find(
    (react) => String(react.userId) === String(req.user._id)
  );

  if (!isUserReaction) {
    if (reactions.includes(reaction))
      comment.reactions.push({ userId: req.user._id, reaction });
  } else {
    if (isUserReaction.reaction !== reaction) {
      isUserReaction.reaction = reaction;
    } else {
      comment.reactions = comment.reactions.filter(
        (react) => String(react.userId) !== String(req.user._id)
      );
    }
  }

  await comment.save();

  return res.status(200).json({ success: true, comment });
};

export const getComment = async (req, res, next) => {
  const { commentId } = req.params;
  const replies = await dbServices.find({
    model: commentModel,
    filter: { replyTo: commentId, isDeleted: false },
    select: "text images replyTo reactions createdBy -_id",
    populate: [{ path: "createdBy", select: "userName image -_id" }],
  });
  const comment = await dbServices.findOne({
    model: commentModel,
    data: { _id: commentId, isDeleted: false },
    select: "text images replyTo reactions createdBy -_id",
    populate: [
      { path: "createdBy", select: "userName image -_id" },
      {
        path: "replies",
        select: "text images replyTo reactions createdBy -_id",
      },
    ],
  });
  return res.status(200).json({
    success: true,
    comment,
    replies,
  });
};

export const freezeComment = async (req, res, next) => {
  const { postId } = req.params;
  const { commentId } = req.params;

  const post = await dbServices.findOne({
    model: postModel,
    filter: { _id: postId, isDeleted: false },
  });

  if (!post) return next(new Error("Post Not Found", { casue: 404 }));

  const comment = await dbServices.findOne({
    model: commentModel,
    filter: { _id: commentId, isDeleted: false },
  });

  if (!comment) return next(new Error("Comment Not Found", { casue: 404 }));

  const isAdmin = req.user.role === roleType.Admin;
  const isCommentOwner = String(comment.createdBy) === String(req.user._id);
  const isPostOwner = String(post.createdBy) === String(req.user._id);

  if (!isAdmin || !isCommentOwner || !isPostOwner) {
    return next(new Error("Unauthorized", { cause: 401 }));
  }

  comment.isDeleted = true;
  comment.deletedBy = req.user._id;
  await comment.save();
  return res
    .status(200)
    .json({ success: true, message: "comment deleted successfully" });
};
export const restoreComment = async (req, res, next) => {
  const { postId } = req.params;
  const { commentId } = req.params;

  const post = await dbServices.findById({
    model: postModel,
    id: { _id: postId },
  });
  if (!post) return next(new Error("post not found", { cause: 404 }));

  const comment = await dbServices.findById({
    model: commentModel,
    id: { _id: commentId },
  });

  if (!comment) return next(new Error("comment not found", { cause: 404 }));

  const isAdmin = req.user.role === roleType.Admin;
  const isCommentOwner = String(comment.createdBy) === String(req.user._id);
  const isPostOwner = String(post.createdBy) === String(req.user._id);

  if (!(isAdmin || isCommentOwner || isPostOwner)) {
    return next(new Error("Unauthorized", { cause: 401 }));
  }

  comment.isDeleted = false;
  comment.deletedBy = null;
  await comment.save();
  return res
    .status(200)
    .json({ success: true, message: "comment restored successfully" });
};
export const deleteComment = async (req, res, next) => {
  const { postId, commentId } = req.params;

  const post = await dbServices.findById({
    model: postModel,
    id: { _id: postId },
  });
  if (!post) return next(new Error("post not found", { cause: 404 }));

  const comment = await dbServices.findById({
    model: commentModel,
    id: { _id: commentId },
  });

  if (!comment) return next(new Error("comment not found", { cause: 404 }));

  const isAdmin = req.user.role === roleType.Admin;
  const isCommentOwner = String(comment.createdBy) === String(req.user._id);
  const isPostOwner = String(post.createdBy) === String(req.user._id);

  if (!(isAdmin || isCommentOwner || isPostOwner))
    return next(new Error("Unauthorized", { cause: 401 }));

  for (const image of comment.images) {
    await cloudinary.uploader.destroy(image.public_id);
  }
  await comment.deleteOne();
  return res.status(200).json({ success: true, message: "comment deleted" });
};

export const replyComment = async (req, res, next) => {
  const { postId, commentId } = req.params;

  const post = await dbServices.findById({
    model: postModel,
    id: { _id: postId, isDeleted: false },
  });

  if (!post) return next(new Error("Post Not Found"), { cause: 404 });

  const comment = await dbServices.findById({
    model: commentModel,
    id: { _id: commentId, isDeleted: false },
  });

  if (!comment) return next(new Error("Comment Not Found"), { cause: 404 });

  const reply = await dbServices.create({
    model: commentModel,
    data: {
      text: req.body.text,
      postId,
      replyTo: comment._id,
      createdBy: req.user._id,
    },
  });

  let allImages;
  if (req.files) {
    if (req.files?.length) {
      allImages = await post.uploadImages(req.files, {
        folder: `posts/${req.user._id}/posts/${post.customerId}/comments`,
      });
      reply.images = allImages;
      await reply.save();
    }
  }

  res.status(201).json({ success: true, reply });
};
