import postModel, { reactions } from "../../DB/models/post.model.js";
import commentModel from "../../DB/models/comment.model.js";
import cloudinary from "../../utils/file uploading/cloudinaryConfig.js";
import * as dbServices from "../../DB/DBservices.js";
import { nanoid } from "nanoid";
import { roleType } from "../../DB/models/user.model.js";

export const createPost = async (req, res, next) => {
  const customerId = nanoid(5);

  const post = await dbServices.create({
    model: postModel,
    data: {
      createdBy: req.user._id,
      customerId,
      content: req.body.content,
    },
  });

  const allimages = await post.uploadImages(req.files, {
    folder: `posts/${req.user._id}/posts/${post.customerId}`,
  });

  post.images = allimages;
  await post.save();
  return res.status(201).json({ success: true, post });
};

export const updatePost = async (req, res, next) => {
  const { postId } = req.params;

  const post = await dbServices.findById({
    model: postModel,
    id: { _id: postId, isDeleted: false },
  });

  if (!post) return next(new Error("post not found", { cause: 404 }));

  if (req.files?.length) {
    for (const file of post.images) {
      await cloudinary.uploader.destroy(file.public_id);
    }

    const allImages = await post.uploadImages(req.files, {
      folder: `posts/${req.user._id}/posts/${post.customerId}`,
    });
    post.images = allImages;
  }

  if (req.body.content) post.content = req.body.content;
  await post.save();
  return res.status(200).json({ success: true, post });
};

export const softDelete = async (req, res, next) => {
  const { postId } = req.params;
  const user = req.user;
  const post = await dbServices.findOne({
    model: postModel,
    data: { _id: postId, isDeleted: false },
  });

  if (!post) return next(new Error("post not found", { cause: 404 }));

  if (
    user.role === roleType.Admin ||
    String(post.createdBy) === String(user._id)
  ) {
    post.isDeleted = true;
    post.deletedBy = user._id;
    await post.save();
    return res.status(200).json({ success: true, post });
  } else {
    return next(new Error("unauthorized"), { cause: 401 });
  }
};
export const restorePost = async (req, res, next) => {
  const { postId } = req.params;
  const user = req.user;
  const post = await dbServices.findOne({
    model: postModel,
    data: { _id: postId },
  });
  if (!post) return next(new Error("post not found", { cause: 404 }));

  if (
    user.role === roleType.Admin ||
    String(post.createdBy) === String(user._id)
  ) {
    post.isDeleted = false;
    post.deletedBy = null;
    await post.save();
    return res.status(200).json({ success: true, post });
  } else {
    return next(new Error("unauthorized"), { cause: 401 });
  }
};
export const spacificPost = async (req, res, next) => {
  const { postId } = req.params;
  const post = await dbServices.findOne({
    model: postModel,
    data: { isDeleted: false, createdBy: req.user._id, _id: postId },
    select: "content images createdBy reactions",
    populate: { path: "createdBy", select: "userName image -_id" },
  });
  if (!post) return next("post not found", { cause: 404 });

  let comments = await post.paginateCommnets(req.query.page);

  if (comments.data.length < 1) comments = [];

  return res.status(200).json({ success: true, result: { post, comments } });
};
export const getPosts = async (req, res, next) => {
  let data = [];
  const posts = await postModel
    .find()
    .select("content images createdBy reactions")
    .populate([{ path: "createdBy", select: "userName image -_id" }])
    .paginate(req.query.page);

  if (posts.data.length < 1)
    return next(new Error("posts not found", { cause: 404 }));

  for (const post of posts.data) {
    const comments = await dbServices.find({
      model: commentModel,
      data: { postId: post._id, isDeleted: false },
      select: "text images replyTo reactions createdBy -_id",
      populate: [{ path: "createdBy", select: "userName image -_id" }],
    });

    data.push({
      post,
      comments,
    });
  }

  posts.data = data;

  return res.status(200).json({ success: true, posts });
};

export const reactionPost = async (req, res, next) => {
  const { postId } = req.params;
  const { reaction } = req.body;
  const post = await dbServices.findById({
    model: postModel,
    id: { _id: postId },
  });

  if (!post) return next(new Error("post not found", { cause: 404 }));

  const isUserReaction = post.reactions.find(
    (react) => String(react.userId) === String(req.user._id)
  );

  if (!isUserReaction) {
    if (reactions.includes(reaction))
      post.reactions.push({ userId: req.user._id, reaction });
  } else {
    if (isUserReaction.reaction !== reaction) {
      isUserReaction.reaction = reaction;
    } else {
      post.reactions = post.reactions.filter(
        (react) => String(react.userId) !== String(req.user._id)
      );
    }
  }

  await post.save();

  return res.status(200).json({ success: true, post });
};

export const deletePost = async (req, res, next) => {
  const { postId } = req.params;

  const post = await dbServices.findById({
    model: postModel,
    id: { _id: postId },
  });

  if (!post) return next(new Error("post not found", { cause: 404 }));

  const isAdmin = String(req.user.role) == String(roleType.Admin);
  const isPostOwner = String(req.user._id) == String(post.createdBy);

  if (!(isAdmin || isPostOwner))
    return next(new Error("unauthorized", { cause: 401 }));

  for (const image of post.images) {
    await cloudinary.uploader.destroy(image.public_id);
  }

  await post.deleteOne();

  return res.status(200).json({ success: true, message: "post deleted" });
};
