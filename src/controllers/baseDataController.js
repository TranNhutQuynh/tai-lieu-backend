import Faculty from "../models/Faculty.js";
import Subject from "../models/Subject.js";
import Category from "../models/Category.js";

export const getFaculties = async (req, res) => {
  try {
    const faculties = await Faculty.find().sort({ name: 1 });
    res.json(faculties);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getSubjects = async (req, res) => {
  try {
    const { facultyId = "", q = "" } = req.query;

    const filter = {
      subjectName: { $regex: q, $options: "i" },
    };

    if (facultyId) filter.facultyId = facultyId;

    const subjects = await Subject.find(filter)
      .populate("facultyId", "name")
      .sort({ subjectName: 1 });

    res.json(subjects);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getCategories = async (req, res) => {
  try {
    const categories = await Category.find().sort({ name: 1 });
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
