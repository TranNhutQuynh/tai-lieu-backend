import express from "express";
import {
  getFaculties,
  getSubjects,
  getCategories,
} from "../controllers/baseDataController.js";

const router = express.Router();

router.get("/faculties", getFaculties);
router.get("/subjects", getSubjects);
router.get("/categories", getCategories);

export default router;
