import { generalFields } from "../../middlewares/validation.middleware.js";
import joi from "joi";

export const registerSchema = joi.object({
  userName: generalFields.userName.required(),
  email: generalFields.email.required(),
  password: generalFields.password.required(),
  confirmPassword: generalFields.confirmPassword.required(),
  phone: generalFields.phone.required(),
  gender: generalFields.gender,
  role: generalFields.role.required(),
});

export const activateSchema = joi.object({
  email: generalFields.email.required(),
  code: generalFields.code.required(),
});

export const ResendCodeSchema = joi.object({
  email: generalFields.email.required(),
});

export const loginSchema = joi.object({
  email: generalFields.email.required(),
  password: generalFields.password
    .message("userName or password invalid")
    .required(),
});

export const loginOTPSchema = joi.object({
  email: generalFields.email.required(),
  code: generalFields.code.required(),
});

export const forgetPasswordSchema = joi.object({
  email: generalFields.email.required(),
});
export const resetPasswordSchema = joi.object({
  email: generalFields.email.required(),
  code: generalFields.code.required(),
  password: generalFields.password.required(),
  confirmPassword: generalFields.confirmPassword.required(),
});
