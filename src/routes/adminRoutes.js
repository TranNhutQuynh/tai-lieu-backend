import express from "express";
import {
  approveDocument,
  createCategory,
  createFaculty,
  createSubject,
  deleteCategory,
  deleteDocumentByAdmin,
  deleteFaculty,
  deleteSubject,
  deleteUser,
  getAllCategoriesByAdmin,
  getAllDocumentsByAdmin,
  getAllFacultiesByAdmin,
  getAllSubjectsByAdmin,
  getPendingDocuments,
  getStats,
  getUsers,
  rejectDocument,
  updateDocumentByAdmin,
  updateUserRole,
} from "../controllers/adminController.js";
import { protect } from "../middlewares/authMiddleware.js";
import { authorize } from "../middlewares/roleMiddleware.js";

const router = express.Router();

router.use(protect, authorize("admin"));

router.get("/documents/pending", getPendingDocuments);
router.get("/documents", getAllDocumentsByAdmin);
router.patch("/documents/:id/approve", approveDocument);
router.patch("/documents/:id/reject", rejectDocument);
router.put("/documents/:id", updateDocumentByAdmin);
router.delete("/documents/:id", deleteDocumentByAdmin);

router.get("/users", getUsers);
router.patch("/users/:id/role", updateUserRole);
router.delete("/users/:id", deleteUser);

router.get("/stats", getStats);

/* FACULTIES */
router.get("/faculties", getAllFacultiesByAdmin);
router.post("/faculties", createFaculty);
router.delete("/faculties/:id", deleteFaculty);

/* SUBJECTS */
router.get("/subjects", getAllSubjectsByAdmin);
router.post("/subjects", createSubject);
router.delete("/subjects/:id", deleteSubject);

/* CATEGORIES */
router.get("/categories", getAllCategoriesByAdmin);
router.post("/categories", createCategory);
router.delete("/categories/:id", deleteCategory);

export default router;
