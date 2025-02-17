import * as dbServices from "../../DB/DBservices.js";
import userModel, {
  defaultImageOnCloud,
  defaultPublicIdOnCloud,
} from "../../DB/models/user.model.js";
import { emailEmitter } from "../../utils/email/emailEvent.js";
import { decrypt, encrypt } from "../../utils/encryption/encryption.js";
import { compare } from "../../utils/hashing/hash.js";
import { subject } from "./../../utils/email/sendEmail.js";
import cloudinary from "../../utils/file uploading/cloudinaryConfig.js";
export const getProfile = async (req, res, next) => {
  const phone = decrypt({
    payload: req.user.phone,
    segnature: process.env.SECRETKEY_PHONE,
  });
  const user = await dbServices.findOne({
    model: userModel,
    data: { _id: req.user._id },
    populate: [{ path: "viewers.userId", select: "email userName image -_id" }],
    select: "userName email image role viewers phone -_id",
  });
  user.phone = phone;
  return res.status(200).json({ success: true, user });
};

export const search = async (req, res, next) => {
  const { userName, page } = req.query;

  const result = await userModel
    .find({ userName: { $regex: userName } })
    .select(
      req.user.role === "Admin" ? "userName email image role" : "userName image"
    )
    .paginate(page);

  return res.status(200).json({ success: true, result });
};

export const viewProfile = async (req, res, next) => {
  const { profileId } = req.params;

  if (profileId === String(req.user._id))
    return res.status(200).json({ success: true, user: req.user });

  const user = await dbServices.findOne({
    model: userModel,
    data: { _id: profileId },
    populate: [{ path: "viewers.userId", select: "email userName image -_id" }],
    select:
      "email userName image -_id viewers.lastTimeVisit viewers.countOfVisits",
  });

  if (!user) return next(new Error("user not found", { cause: 404 }));

  let viewers = await dbServices.findOne({
    model: userModel,
    data: { _id: profileId, "viewers.userId": req.user._id },
    select: "viewers",
  });

  if (!viewers) {
    await dbServices.findByIdAndUpdate({
      model: userModel,
      filter: profileId,
      data: {
        $push: {
          viewers: {
            userId: req.user._id,
            countOfVisits: 1,
            lastTimeVisit: new Date(),
          },
        },
      },
      options: { new: true },
    });
  } else {
    await dbServices.updateOne({
      model: userModel,
      filter: { _id: profileId, "viewers.userId": req.user._id },
      data: {
        $inc: { "viewers.$.countOfVisits": 1, lastTimeVisit: new Date() },
      },
      options: { new: true },
    });
  }

  return res.status(200).json({ success: true, user });
};

export const updateEmail = async (req, res, next) => {
  const { email } = req.body;

  const user = await dbServices.findOne({
    model: userModel,
    data: { email },
  });

  if (user) return next(new Error("Email Already Exist"));

  // send email

  emailEmitter.emit(
    "sendEmail",
    req.user.email,
    req.user.userName,
    subject.updateEmail
  );

  emailEmitter.emit("updateEmail", req.user._id, email, req.user.userName);

  req.user.tempEmail = email;
  await req.user.save();

  return res.status(200).json({
    success: true,
    message:
      "please check your old email and new email to complete the process",
  });
};

export const resetEmail = async (req, res, next) => {
  const { oldEmailCode, newEmailCode } = req.body;

  if (!compare({ plainText: oldEmailCode, hash: req.user.code }))
    return next(new Error("in-valid code for old email", { cause: 400 }));

  if (!compare({ plainText: newEmailCode, hash: req.user.tempEmailCode }))
    return next(new Error("in-valid code for new email", { cause: 400 }));
  // update db

  await dbServices.updateOne({
    model: userModel,
    filter: { _id: req.user._id },
    data: {
      email: req.user.tempEmail,
      code: "",
      codeExpireAt: "",
      tempEmail: "",
      tempEmailCode: "",
      tempEmailCodeExpireAt: "",
    },
  });

  return res.status(200).json({ success: true, message: "Email Updated" });
};

export const updatePassword = async (req, res, next) => {
  const { oldPassword, password } = req.body;

  if (!compare({ plainText: oldPassword, hash: req.user.password }))
    return next(new Error("In-Valid Passowrd"));

  await req.user.save();

  return res.status(200).json({ success: true, message: "password updated" });
};

export const updateProfile = async (req, res, next) => {
  if (req.body.phone) {
    req.body.phone = encrypt({
      plainText: req.phone,
      segnature: process.env.SECRETKEY_PHONE,
    });
  }
  const user = await dbServices.findOneAndUpdate({
    model: userModel,
    filter: { _id: req.user._id },
    data: req.body,
    option: { new: true, runValidators: true },
  });

  return res.status(200).json({ success: true, user });
};

export const uploadImages = async (req, res, next) => {
  if (req.files.length === 0) {
    return next(new Error("No files uploaded"));
  }
  const allImages = [];

  for (const file of req.files) {
    const { secure_url, public_id } = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: `users/${req.user._id}/cover_images`,
        },
        (error, result) => {
          if (error) return reject(error);
          resolve(result);
        }
      );
      uploadStream.end(file.buffer);
    });

    allImages.push({ secure_url, public_id });
  }

  req.user.images = allImages;
  await req.user.save();
  return res.status(200).json({ success: true, user: req.user });
};

export const uploadPictureInCloud = async (req, res, next) => {
  if (!req.file) {
    return next(new Error("No files uploaded"));
  }
  const uploadStream = cloudinary.uploader.upload_stream(
    { folder: `users/${req.user._id}/profilePicture` },
    (error, result) => {
      if (error) return next(error);

      const { secure_url, public_id } = result;

      req.user.image = { secure_url, public_id };
      req.user.save();
    }
  );
  uploadStream.end(req.file.buffer);

  res.status(200).json({ success: true, user: req.user });
};

export const deletePictureInCloud = async (req, res, next) => {
  const result = await cloudinary.uploader.destroy(req.user.image.public_id);

  if (result === "ok") {
    req.user.image = {
      secure_url: defaultImageOnCloud,
      public_id: defaultPublicIdOnCloud,
    };
  }
  await req.user.save();

  return res.status(200).json({ success: true, user: req.user });
};
