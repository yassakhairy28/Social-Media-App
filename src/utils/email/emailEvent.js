import { EventEmitter } from "events";
import { hash } from "../hashing/hash.js";
import { customAlphabet } from "nanoid";
import userModel from "../../DB/Models/user.model.js";
import * as dbServices from "../../DB/DBservices.js";
import { sendEmail, subject } from "./sendEmail.js";
import { templateOTP } from "./templateOTP.js";

export const emailEmitter = new EventEmitter();

const otp = customAlphabet("0123456789", 5)();
const hashOtp = hash({ plainText: otp });
const expireTime = Date.now() + 5 * 60 * 1000;

emailEmitter.on("sendEmail", async (email, userName, subjectType) => {
  // Update DB

  await dbServices.updateOne({
    model: userModel,
    filter: { email },
    data: { code: hashOtp, codeExpireAt: expireTime },
  });

  // Message Handling
  let msg;
  switch (subjectType) {
    case subject.register:
      msg =
        "Thank you for registering with [Social Media App]. To complete your registration, please use the following OTP.";
      break;
    case subject.login:
      msg = "To complete your login, please enter the following OTP.";
      break;
    case subject.resetPassword:
      msg = "To reset your password, please enter the following OTP.";
      break;
    case subject.updateEmail:
      msg = "To update your email, please enter the following OTP.";
      break;
    default:
      msg = "Here is your OTP code:";
  }

  // Send email
  await sendEmail({
    to: email,
    subject: subjectType,
    html: templateOTP(otp, userName, subjectType, msg),
  });
});

emailEmitter.on("updateEmail", async (id, email, userName) => {
  const user = await dbServices.findByIdAndUpdate({
    model: userModel,
    filter: { _id: id },
    data: { tempEmailCode: hashOtp, tempEmailCodeExpireAt: expireTime },
  });

  const msg = "To update your email, please enter the following OTP.";
  await sendEmail({
    to: email,
    subject: subject.updateEmail,
    html: templateOTP(otp, userName, subject.updateEmail, msg),
  });
});
