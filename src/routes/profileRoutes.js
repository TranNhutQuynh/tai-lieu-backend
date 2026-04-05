import express from "express";
import {
  deleteMyDocument,
  getMyDocuments,
  getMyProfile,
  updateMyDocument,
  updateMyProfile,
} from "../controllers/profileController.js";
import { protect } from "../middlewares/authMiddleware.js";
import {
  uploadAvatar,
  uploadDocumentFields,
} from "../middlewares/uploadMiddleware.js";

const router = express.Router();

router.use(protect);

router.get("/me", getMyProfile);
router.put("/me", uploadAvatar, updateMyProfile);

router.get("/my-documents", getMyDocuments);
router.put("/my-documents/:id", uploadDocumentFields, updateMyDocument);
router.delete("/my-documents/:id", deleteMyDocument);

export default router;
