import joi from "joi";
import { gendertype, roleType } from "../DB/models/user.model.js";
import { Types } from "mongoose";
import { reactions } from "../DB/models/post.model.js";

export const validate = (schema) => {
  return (req, res, next) => {
    const data = { ...req.body, ...req.params, ...req.query };
    if (req.file || req.files?.length) {
      data.files = req.file || req.files;
    }
    const result = schema.validate(data, { abortEarly: false });

    if (result.error) {
      const messagesError = result.error.details.map((err) => err.message);

      next(new Error(messagesError, { cause: 400 }));
    }
    next();
  };
};

export const generalFields = {
  userName: joi.string().min(3).max(30).trim(),
  email: joi.string().email(),
  password: joi.string().min(6),
  confirmPassword: joi.string().valid(joi.ref("password")).min(6),
  gender: joi.string().valid(...Object.values(gendertype)),
  role: joi.string().custom((value, helper) => {
    return Object.values(roleType).includes(value)
      ? true
      : helper.message("in-valid role");
  }),
  phone: joi
    .string()
    .pattern(new RegExp(/^(\+201|01|00201)[0-2,5]{1}[0-9]{8}/)),
  code: joi.string().pattern(/^[0-9]{5}$/),
  id: joi.string().custom((value, helper) => {
    return Types.ObjectId.isValid(value) ? true : helper.message("in-valid id");
  }),
  DOB: joi.date,
  address: joi.string(),
  content: joi.string().min(3).max(5000),
  fileObject: joi.object({
    fieldname: joi.string().required(),
    originalname: joi.string().required(),
    encoding: joi.string().required(),
    mimetype: joi.string().required(),
    buffer: joi.any().required(),
    size: joi.number().required(),
  }),
  reaction: joi.string().valid(...reactions),
  page: joi.number().integer().min(1),
};
