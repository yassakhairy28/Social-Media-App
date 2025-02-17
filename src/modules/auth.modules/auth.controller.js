import { Router } from "express";
import * as auth from "./auth.service.js";
import { validate } from "../../middlewares/validation.middleware.js";
import * as authValidation from "./auth.validation.js";
import asyncHandler from "./../../utils/error handling/asyncHandler.js";
import { authentication } from "./../../middlewares/auth.meddleware.js";
import resendCode from "./../../utils/email/resendCode.js";
import { subject } from "../../utils/email/sendEmail.js";

const authRouter = Router();

authRouter.post(
  "/register",
  validate(authValidation.registerSchema),
  asyncHandler(auth.register)
);

authRouter.post(
  "/activate-account",
  validate(authValidation.activateSchema),
  asyncHandler(auth.activaieAccount)
);

authRouter.post(
  "/ResendCodeRegister",
  validate(authValidation.ResendCodeSchema),
  asyncHandler(resendCode(subject.register))
);

authRouter.post(
  "/login",
  validate(authValidation.loginSchema),
  asyncHandler(auth.login)
);
authRouter.post(
  "/login-otp",
  validate(authValidation.loginOTPSchema),
  asyncHandler(auth.loginOTP)
);

authRouter.post(
  "/ResendCodeLogin",
  validate(authValidation.ResendCodeSchema),
  asyncHandler(resendCode(subject.login))
);
// authRouter.post("/loginWithGmail", asyncHandler(auth.loginWithGmail));

authRouter.get("/refresh_token", asyncHandler(auth.refreshToken));

authRouter.post(
  "/forget-password",
  validate(authValidation.forgetPasswordSchema),
  asyncHandler(auth.forgetPassword)
);

authRouter.post(
  "/reset-password",
  validate(authValidation.resetPasswordSchema),
  asyncHandler(auth.resetPassword)
);

authRouter.post(
  "/ResendCodePassword",
  validate(authValidation.ResendCodeSchema),
  asyncHandler(resendCode(subject.resetPassword))
);
authRouter.get("/logout", authentication, asyncHandler(auth.logout));

export default authRouter;
