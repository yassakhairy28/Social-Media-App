import CryptoJS from "crypto-js";

export const encrypt = ({ payload, segnature }) => {
  return CryptoJS.AES.encrypt(payload, segnature).toString();
};

export const decrypt = ({ payload, segnature }) => {
  return CryptoJS.AES.decrypt(payload, segnature).toString(CryptoJS.enc.Utf8);
};
