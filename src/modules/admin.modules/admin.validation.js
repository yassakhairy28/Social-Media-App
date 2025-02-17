import { generalFields } from "../../middlewares/validation.middleware.js";
import joi from "joi";

export const changeRoleSchema = joi
  .object({
    userId: generalFields.id.required(),
    role: generalFields.role.required(),
    pagePosts: generalFields.page,
    pageUsers: generalFields.page,
  })
  .required();
