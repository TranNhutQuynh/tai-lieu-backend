import express from "express";
import {
  addCommentRating,
  createDocument,
  downloadDocument,
  getApprovedDocuments,
  getDocumentDetail,
} from "../controllers/documentController.js";
import { protect } from "../middlewares/authMiddleware.js";
import { uploadDocumentFields } from "../middlewares/uploadMiddleware.js";

const router = express.Router();

router.get("/", getApprovedDocuments);
router.get("/:id", getDocumentDetail);

router.post("/", protect, uploadDocumentFields, createDocument);
router.get("/:id/download", protect, downloadDocument);
router.post("/:id/comment-rating", protect, addCommentRating);

export default router;