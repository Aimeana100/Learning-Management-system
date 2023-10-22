import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';

import defaultVars from '../config/defaultVars';

cloudinary.config({
  cloud_name: defaultVars.cloudinary.name,
  api_key: defaultVars.cloudinary.key,
  api_secret: defaultVars.cloudinary.secret
});
const storage = multer.diskStorage({
  filename: (_req, file, cb) => {
    cb(null, file.originalname);
  }
});

export const upload = multer({
  storage: storage,
  fileFilter: (_req, _file, cb) => {
    cb(null, true);
  }
});
