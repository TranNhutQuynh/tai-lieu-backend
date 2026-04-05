import Document from "../models/Document.js";
import User from "../models/User.js";
import Download from "../models/Download.js";
import Subject from "../models/Subject.js";
import Category from "../models/Category.js";
import Faculty from "../models/Faculty.js";

export const getPendingDocuments = async (req, res) => {
  try {
    const { q = "" } = req.query;

    const documents = await Document.find({
      status: "pending",
      title: { $regex: q, $options: "i" },
    })
      .populate("uploaderId", "fullName username")
      .populate("facultyId", "name")
      .populate("subjectId", "subjectCode subjectName")
      .populate("categoryId", "name")
      .sort({ createdAt: -1 });

    res.json(documents);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getAllDocumentsByAdmin = async (req, res) => {
  try {
    const { q = "", status = "" } = req.query;

    const filter = {
      title: { $regex: q, $options: "i" },
    };

    if (status) filter.status = status;

    const documents = await Document.find(filter)
      .populate("uploaderId", "fullName username")
      .populate("facultyId", "name")
      .populate("subjectId", "subjectCode subjectName")
      .populate("categoryId", "name")
      .sort({ createdAt: -1 });

    res.json(documents);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const approveDocument = async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);

    if (!document) {
      return res.status(404).json({ message: "Không tìm thấy tài liệu" });
    }

    document.status = "approved";
    await document.save();

    res.json({ message: "Phê duyệt thành công", document });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const rejectDocument = async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);

    if (!document) {
      return res.status(404).json({ message: "Không tìm thấy tài liệu" });
    }

    document.status = "rejected";
    await document.save();

    res.json({ message: "Từ chối tài liệu thành công", document });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateDocumentByAdmin = async (req, res) => {
  try {
    const { title, description, status } = req.body;

    const document = await Document.findById(req.params.id);
    if (!document) {
      return res.status(404).json({ message: "Không tìm thấy tài liệu" });
    }

    if (title !== undefined) document.title = title;
    if (description !== undefined) document.description = description;
    if (status) document.status = status;

    await document.save();

    res.json({ message: "Cập nhật tài liệu thành công", document });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteDocumentByAdmin = async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);
    if (!document) {
      return res.status(404).json({ message: "Không tìm thấy tài liệu" });
    }

    await document.deleteOne();
    res.json({ message: "Xóa tài liệu thành công" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getUsers = async (req, res) => {
  try {
    const { q = "" } = req.query;

    const users = await User.find({
      $or: [
        { fullName: { $regex: q, $options: "i" } },
        { email: { $regex: q, $options: "i" } },
        { username: { $regex: q, $options: "i" } },
      ],
    })
      .select("-password")
      .sort({ createdAt: -1 });

    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;

    if (!["student", "lecturer", "admin"].includes(role)) {
      return res.status(400).json({ message: "Role không hợp lệ" });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "Không tìm thấy người dùng" });
    }

    user.role = role;
    await user.save();

    res.json({
      message: "Cập nhật vai trò thành công",
      user: {
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        username: user.username,
        role: user.role,
        faculty: user.faculty,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteUser = async (req, res) => {
  try {
    if (req.user._id.toString() === req.params.id) {
      return res.status(400).json({
        message: "Không thể xóa chính tài khoản admin đang đăng nhập",
      });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "Không tìm thấy người dùng" });
    }

    await user.deleteOne();
    res.json({ message: "Xóa người dùng thành công" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* FACULTIES */

export const getAllFacultiesByAdmin = async (req, res) => {
  try {
    const { q = "" } = req.query;

    const faculties = await Faculty.find({
      name: { $regex: q, $options: "i" },
    }).sort({ createdAt: -1 });

    res.json(faculties);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createFaculty = async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Vui lòng nhập tên khoa" });
    }

    const exists = await Faculty.findOne({ name });
    if (exists) {
      return res.status(400).json({ message: "Khoa đã tồn tại" });
    }

    const faculty = await Faculty.create({
      name,
      description: description || "",
    });

    res.status(201).json({
      message: "Thêm khoa thành công",
      faculty,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteFaculty = async (req, res) => {
  try {
    const faculty = await Faculty.findById(req.params.id);
    if (!faculty) {
      return res.status(404).json({ message: "Không tìm thấy khoa" });
    }

    const usedInSubjects = await Subject.countDocuments({
      facultyId: faculty._id,
    });
    const usedInDocuments = await Document.countDocuments({
      facultyId: faculty._id,
    });

    if (usedInSubjects > 0 || usedInDocuments > 0) {
      return res.status(400).json({
        message:
          "Không thể xóa khoa vì đang có môn học hoặc tài liệu sử dụng khoa này",
      });
    }

    await faculty.deleteOne();
    res.json({ message: "Xóa khoa thành công" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* SUBJECTS */

export const getAllSubjectsByAdmin = async (req, res) => {
  try {
    const { q = "" } = req.query;

    const subjects = await Subject.find({
      $or: [
        { subjectCode: { $regex: q, $options: "i" } },
        { subjectName: { $regex: q, $options: "i" } },
      ],
    })
      .populate("facultyId", "name")
      .sort({ createdAt: -1 });

    res.json(subjects);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createSubject = async (req, res) => {
  try {
    const { subjectCode, subjectName, facultyId, credit } = req.body;

    if (!subjectCode || !subjectName || !facultyId) {
      return res.status(400).json({
        message: "Vui lòng nhập đầy đủ mã môn học, tên môn học và khoa",
      });
    }

    const exists = await Subject.findOne({ subjectCode });
    if (exists) {
      return res.status(400).json({ message: "Mã môn học đã tồn tại" });
    }

    const subject = await Subject.create({
      subjectCode,
      subjectName,
      facultyId,
      credit: credit || 0,
    });

    res.status(201).json({
      message: "Thêm môn học thành công",
      subject,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteSubject = async (req, res) => {
  try {
    const subject = await Subject.findById(req.params.id);
    if (!subject) {
      return res.status(404).json({ message: "Không tìm thấy môn học" });
    }

    const usedInDocuments = await Document.countDocuments({
      subjectId: subject._id,
    });

    if (usedInDocuments > 0) {
      return res.status(400).json({
        message:
          "Không thể xóa môn học vì đang có tài liệu sử dụng môn học này",
      });
    }

    await subject.deleteOne();
    res.json({ message: "Xóa môn học thành công" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* CATEGORIES */

export const getAllCategoriesByAdmin = async (req, res) => {
  try {
    const { q = "" } = req.query;

    const categories = await Category.find({
      name: { $regex: q, $options: "i" },
    }).sort({ createdAt: -1 });

    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createCategory = async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Vui lòng nhập tên danh mục" });
    }

    const exists = await Category.findOne({ name });
    if (exists) {
      return res.status(400).json({ message: "Danh mục đã tồn tại" });
    }

    const category = await Category.create({
      name,
      description: description || "",
    });

    res.status(201).json({
      message: "Thêm danh mục thành công",
      category,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ message: "Không tìm thấy danh mục" });
    }

    const usedInDocuments = await Document.countDocuments({
      categoryId: category._id,
    });

    if (usedInDocuments > 0) {
      return res.status(400).json({
        message:
          "Không thể xóa danh mục vì đang có tài liệu sử dụng danh mục này",
      });
    }

    await category.deleteOne();
    res.json({ message: "Xóa danh mục thành công" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalDocuments = await Document.countDocuments();
    const totalPending = await Document.countDocuments({ status: "pending" });
    const totalApproved = await Document.countDocuments({ status: "approved" });
    const totalRejected = await Document.countDocuments({ status: "rejected" });
    const totalDownloads = await Download.countDocuments();
    const totalFaculties = await Faculty.countDocuments();
    const totalSubjects = await Subject.countDocuments();
    const totalCategories = await Category.countDocuments();

    res.json({
      totalUsers,
      totalDocuments,
      totalPending,
      totalApproved,
      totalRejected,
      totalDownloads,
      totalFaculties,
      totalSubjects,
      totalCategories,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
