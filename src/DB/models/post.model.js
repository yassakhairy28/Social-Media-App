import mongoose, { Schema, Types, model } from "mongoose";
import cloudinary from "../../utils/file uploading/cloudinaryConfig.js";
import commentModel from "./comment.model.js";
export const reactions = [
  "Like",
  "Love",
  "Haha",
  "Wow",
  "Sad",
  "Angry",
  "Supported",
];
const postSchema = new Schema(
  {
    content: {
      type: String,
      minLength: 3,
      maxLength: 5000,
      trim: true,
      required: function () {
        return this.images?.length ? false : true;
      },
    },
    images: [
      {
        secure_url: String,
        public_id: String,
      },
    ],
    createdBy: {
      type: Types.ObjectId,
      ref: "user",
      required: true,
    },
    deletedBy: {
      type: Types.ObjectId,
      ref: "user",
    },
    reactions: [
      {
        reaction: {
          type: String,
          enum: reactions,
          default: "Like",
        },
        userId: {
          type: Types.ObjectId,
          ref: "user",
          required: true,
        },
      },
    ],
    isDeleted: {
      type: Boolean,
      default: false,
    },
    customerId: {
      type: String,
    },
  },

  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

postSchema.query.paginate = async function (page) {
  page = page || 1;
  page = Number(page);

  const limit = 5;
  const skip = limit * (page - 1);

  const data = await this.skip(skip).limit(limit);
  const items = await this.model.countDocuments();
  const totalPages = Math.ceil(items / limit);

  return {
    data,
    totalItems: items,
    currentPage: page,
    totalPages,
    itemsPerPage: data.length,
    nextPage: page < totalPages ? page + 1 : null,
    previousPage: page > 1 ? page - 1 : null,
  };
};

postSchema.methods.paginateCommnets = async function (page) {
  page = Number(page) || 1;

  const limit = 10;
  const skip = limit * (page - 1);

  const data = await commentModel
    .find({ postId: this._id })
    .skip(skip)
    .limit(limit)
    .populate([{ path: "createdBy", select: "userName image -_id" }])
    .select("text images replyTo reactions createdBy -_id");
  const items = await commentModel.countDocuments({ postId: this._id });
  const totalPages = Math.ceil(items / limit);

  return {
    data,
    totalItems: items,
    currentPage: page,
    totalPages,
    itemsPerPage: data.length,
    nextPage: page < totalPages ? page + 1 : null,
    previousPage: page > 1 ? page - 1 : null,
  };
};

postSchema.methods.uploadImages = async function (images, { folder }) {
  const uploadedImages = [];

  for (const image of images) {
    const { secure_url, public_id } = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder,
        },
        (error, result) => {
          if (error) return reject(error);
          resolve(result);
        }
      );
      uploadStream.end(image.buffer);
    });

    uploadedImages.push({ secure_url, public_id });
  }

  return uploadedImages;
};

postSchema.post(
  "deleteOne",
  { document: true, query: false },
  async (doc, next) => {
    const comments = await commentModel.find({ postId: doc._id });
    if (comments.length > 0) {
      for (const comment of comments) {
        for (const image of comment.images) {
          await cloudinary.uploader.destroy(image.public_id);
        }
        await comment.deleteOne();
      }
    }

    return next();
  }
);

postSchema.virtual("comments", {
  ref: "comment",
  foreignField: "postId",
  localField: "_id",
});
const postModel = mongoose.model.post || model("post", postSchema);

export default postModel;
