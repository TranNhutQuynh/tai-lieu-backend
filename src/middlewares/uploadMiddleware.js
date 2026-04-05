import multer from "multer";

const storage = multer.memoryStorage();

const documentTypes = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
];

const imageTypes = ["image/png", "image/jpeg", "image/jpg", "image/webp"];

const mixedFilter = (req, file, cb) => {
  if (file.fieldname === "file") {
    if (documentTypes.includes(file.mimetype)) {
      return cb(null, true);
    }
    return cb(new Error("Chỉ cho phép PDF, DOC, DOCX, PPT, PPTX"), false);
  }

  if (file.fieldname === "coverImage" || file.fieldname === "avatar") {
    if (imageTypes.includes(file.mimetype)) {
      return cb(null, true);
    }
    return cb(new Error("Chỉ cho phép ảnh PNG, JPG, JPEG, WEBP"), false);
  }

  return cb(new Error("Trường upload không hợp lệ"), false);
};

const upload = multer({
  storage,
  fileFilter: mixedFilter,
  limits: { fileSize: 20 * 1024 * 1024 },
});

export const uploadDocumentFields = upload.fields([
  { name: "file", maxCount: 1 },
  { name: "coverImage", maxCount: 1 },
]);

export const uploadAvatar = upload.single("avatar");
