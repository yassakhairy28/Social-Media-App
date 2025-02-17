import multer, { memoryStorage } from "multer";
import { fileTypeFromBuffer } from "file-type";

export const filesValidation = {
  image: ["image/png", "image/jpeg", "image/jpg"],
};

export const upload = multer({
  storage: memoryStorage(),
});

export const filesFilter = (filesTypes) => async (req, res, next) => {
  const files = Array.isArray(req.files)
    ? req.files
    : req.file
    ? [req.file]
    : [];

  for (const file of files) {
    const buffer = file.buffer;
    const fileType = await fileTypeFromBuffer(buffer);
    if (!fileType || !filesTypes.includes(fileType.mime)) {
      return next(new Error("Invalid file type"));
    }

    switch (filesTypes) {
      case filesValidation.image:
        if (file.size > 5760481 * 10)
          return next(new Error("File size is larger than 10mb"));
        break;
      case filesValidation.audio:
        if (file.size > 5760481 * 20)
          return next(new Error("File size is larger than 20mb"));
        break;
      case filesValidation.video:
        if (file.size > 5760481 * 30)
          return next(new Error("File size is larger than 30mb"));
        break;
    }
  }
  return next();
};
