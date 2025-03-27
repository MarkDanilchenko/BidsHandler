import multer from "multer";
import path from "path";
import { v4 as uuidv4 } from "uuid";

const avatarStorage = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, "./uploads/avatars");
  },
  filename: (req, file, callback) => {
    const fileName = `${file.fieldname}-${uuidv4()}${path.extname(file.originalname)}`;

    callback(null, fileName);
  },
});

const uploadAvatar = multer({
  storage: avatarStorage,
  fileFilter: (req, file, callback) => {
    if (!["image/png", "image/jpg", "image/jpeg"].includes(file.mimetype)) {
      return callback(new Error("File type is not supported. Only .JPG, .PNG, .JPEG are allowed!"));
    }

    callback(null, true);
  },
  limits: {
    files: 1,
    fileSize: 1024 * 1024 * 1,
  },
});

export { uploadAvatar };
