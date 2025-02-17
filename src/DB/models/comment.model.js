import mongoose, { Schema, Types, model } from "mongoose";
import cloudinary from "../../utils/file uploading/cloudinaryConfig.js";

export const reactions = [
  "Like",
  "Love",
  "Haha",
  "Wow",
  "Sad",
  "Angry",
  "Supported",
];
const commentSchema = new Schema(
  {
    text: {
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
    postId: {
      type: Types.ObjectId,
      ref: "post",
      required: true,
    },
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
        },
      },
    ],
    replyTo: {
      type: Types.ObjectId,
      ref: "comment",
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },

  {
    timestamps: true,
    toJson: { virtuals: true },
    toObject: { virtuals: true },
  }
);
commentSchema.post(
  "deleteOne",
  { document: true, query: false },
  async function (doc, next) {
    const replies = await doc.constructor.find({ replyTo: doc._id });
    if (replies.length > 0) {
      for (const reply of replies) {
        for (const image of reply.images) {
          await cloudinary.uploader.destroy(image.public_id);
        }
        await reply.deleteOne();
      }
    }
    return next();
  }
);

commentSchema.virtual("replies", {
  foreignField: "replyTo",
  localField: "_id",
  ref: "comment",
});

const commentModel = mongoose.models['comment'] || model("comment", commentSchema);

export default commentModel;
