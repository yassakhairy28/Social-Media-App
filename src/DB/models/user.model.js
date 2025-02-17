import mongoose, { Schema, Types, model } from "mongoose";
import cloudinary from "../../utils/file uploading/cloudinaryConfig.js";
import { hash } from "../../utils/hashing/hash.js";

export const roleType = {
  SuperAdmin: "SuperAdmin",
  Admin: "Admin",
  User: "User",
};

export const gendertype = {
  male: "male",
  female: "female",
};

export const providers = {
  System: "System",
  Google: "Google",
};
export const defaultImageOnCloud =
  "https://res.cloudinary.com/dfomwahqk/image/upload/v1738723070/defaultPicture_ym4pxo.jpg";
export const defaultPublicIdOnCloud = "1738723070/defaultPicture_ym4pxo";
const userSchema = new Schema(
  {
    userName: {
      type: String,
      required: [true, "Username is required"],
      trim: true,
      minLength: [3, "username must be at least 3 characters"],
      maxLength: [30, "username must be at most 30 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: [true, "Email already exist"],
      lowercase: true,
      match: /^[\w-\.]+@([\w-]+\.)+[\w-]{2,5}$/,
    },
    confirmEmail: {
      type: Boolean,
      default: false,
    },
    password: {
      type: String,
      trim: true,
    },
    role: {
      type: String,
      enum: Object.values(roleType),
      default: roleType.User,
    },
    providers: {
      type: String,
      enum: Object.values(providers),
      default: providers.System,
    },
    gender: {
      type: String,
      enum: Object.values(gendertype),
      default: gendertype.male,
    },
    phone: {
      type: String,
    },
    image: {
      secure_url: {
        type: String,
        default: defaultImageOnCloud,
      },
      public_id: {
        type: String,
        default: defaultPublicIdOnCloud,
      },
    },
    DOB: Date,
    images: [
      {
        secure_url: String,
        public_id: String,
      },
    ],
    address: String,
    isDeleted: {
      type: Boolean,
      default: false,
    },
    code: String,
    codeExpireAt: Date,
    tempEmail: String,
    tempEmailCode: String,
    tempEmailCodeExpireAt: Date,
    countOfSentCode: {
      type: Number,
    },
    waitingTime: Date,
    lastSentCount: Number,
    credentialsTime: Date,
    viewers: [
      {
        userId: { type: Types.ObjectId, ref: "user" },
        lastTimeVisit: Date,
        countOfVisits: Number,
      },
    ],
  },
  {
    timestamps: true,
  }
);

userSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    this.password = hash({ plainText: this.password });
  }

  return next();
});

userSchema.query.paginate = async function (page) {
  page = Number(page) || 1;
  const limit = 10;
  const skip = (page - 1) * limit;
  const data = await this.find({}).skip(skip).limit(limit);
  const items = await this.model.countDocuments({});
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

const userModel = mongoose.models["user"] || model("user", userSchema);

export default userModel;
