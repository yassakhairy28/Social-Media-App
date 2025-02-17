import bcrypt from "bcrypt";

export const hash = ({ plainText, salt = process.env.SALT }) => {
  return bcrypt.hashSync(plainText, Number(salt));
};

export const compare = ({ plainText, hash }) => {
  return bcrypt.compareSync(plainText, hash);
};
