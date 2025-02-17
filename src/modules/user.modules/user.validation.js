import { generalFields } from "../../middlewares/validation.middleware.js";
import joi from "joi";

export const viewProfileSchema = joi.object({
  profileId: generalFields.id.required(),
});

export const updateEMailSchema = joi
  .object({
    email: generalFields.email.required(),
  })
  .required();

export const resetEmailSchema = joi
  .object({
    oldEmailCode: generalFields.code.required(),
    newEmailCode: generalFields.code.required(),
  })
  .required();

export const updatePasswordSchema = joi
  .object({
    oldPassword: generalFields.password.required(),
    password: generalFields.password.not(joi.ref("oldPassword")).required(),
    consfirmPassword: generalFields.confirmPassword.required(),
  })
  .required();

export const updateProfileSchema = joi.object({
  userName: generalFields.userName,
  phone: generalFields.phone,
  gender: generalFields.gender,
  DOB: generalFields.DOB,
  address: generalFields.address,
});

export const searchSchema = joi.object({
  userName: generalFields.userName,
  page: generalFields.page,
});
