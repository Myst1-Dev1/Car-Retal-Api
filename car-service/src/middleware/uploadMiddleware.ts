// import multer from "multer";
// import path from "path";

// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, "uploads/");
//   },
//   filename: function (req, file, cb) {
//     cb(null, file.fieldname + "-" + Date.now() + path.extname(file.originalname));
//   },
// });

// const checkFileFilter = (req: any, file: any, cb: any) => {
//   if (file.mimetype.startsWith("image")) {
//     cb(null, true);
//   } else {
//     cb(new Error("Not an image! Please upload only images."));
//   }
// };

// export default multer({
//   storage,
//   fileFilter: checkFileFilter,
//   limits: {
//     fileSize: 5 * 1024 * 1024, // 5MB
//   },
// });

import multer from "multer";
import path from "path";

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) =>
    cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`),
});

const allowedExt = new Set([
  ".jpg", ".jpeg", ".png", ".webp", ".gif", ".bmp", ".avif", ".heic", ".heif",
]);

const checkFileFilter: multer.Options["fileFilter"] = (req, file, cb) => {
  const mime = (file.mimetype || "").toLowerCase();
  const name = (file.originalname || "").toLowerCase();
  const ext  = path.extname(name);

  // Muitos navegadores mandam parte "vazia" como application/octet-stream com nome "blob" ou vazio.
  if (!name || name === "blob" || mime === "application/octet-stream") {
    return cb(null, false); // ignora silenciosamente
  }

  // Aceita qualquer image/* E garanta extensão conhecida
  if (mime.startsWith("image/") && allowedExt.has(ext)) {
    return cb(null, true);
  }

  return cb(new Error("Not an image! Please upload only images."));
};

export default multer({
  storage,
  fileFilter: checkFileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
    files: 6,                  // 1 capa + 5 thumbs
  },
});