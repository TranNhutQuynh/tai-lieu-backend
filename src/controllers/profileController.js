import streamifier from "streamifier";
import cloudinary from "../config/cloudinary.js";
import User from "../models/User.js";
import Document from "../models/Document.js";
import Subject from "../models/Subject.js";

const uploadAvatarToCloudinary = (buffer, originalname) =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        resource_type: "image",
        folder: "tai-lieu-hoc-tap/avatar",
        public_id: `${Date.now()}-${originalname}`,
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );

    streamifier.createReadStream(buffer).pipe(stream);
  });

const uploadRawToCloudinary = (buffer, originalname) =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        resource_type: "raw",
        folder: "tai-lieu-hoc-tap/files",
        public_id: `${Date.now()}-${originalname}`,
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );

    streamifier.createReadStream(buffer).pipe(stream);
  });

const uploadImageToCloudinary = (buffer, originalname) =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        resource_type: "image",
        folder: "tai-lieu-hoc-tap/covers",
        public_id: `${Date.now()}-${originalname}`,
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );

    streamifier.createReadStream(buffer).pipe(stream);
  });

export const getMyProfile = async (req, res) => {
  res.json(req.user);
};

export const updateMyProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: "Không tìm thấy người dùng" });
    }

    const { fullName, faculty } = req.body;

    if (fullName !== undefined) user.fullName = fullName;
    if (faculty !== undefined) user.faculty = faculty;

    if (req.file) {
      const uploaded = await uploadAvatarToCloudinary(
        req.file.buffer,
        req.file.originalname
      );
      user.avatarUrl = uploaded.secure_url;
    }

    await user.save();

    res.json({
      message: "Cập nhật hồ sơ thành công",
      user: {
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        username: user.username,
        role: user.role,
        faculty: user.faculty,
        avatarUrl: user.avatarUrl,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getMyDocuments = async (req, res) => {
  try {
    const { q = "" } = req.query;

    const documents = await Document.find({
      uploaderId: req.user._id,
      title: { $regex: q, $options: "i" },
    })
      .populate("facultyId", "name")
      .populate("subjectId", "subjectCode subjectName")
      .populate("categoryId", "name")
      .sort({ createdAt: -1 });

    res.json(documents);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateMyDocument = async (req, res) => {
  try {
    const document = await Document.findOne({
      _id: req.params.id,
      uploaderId: req.user._id,
    });

    if (!document) {
      return res
        .status(404)
        .json({ message: "Không tìm thấy tài liệu của bạn" });
    }

    const { title, description, facultyId, subjectId, categoryId } = req.body;

    const subject = await Subject.findById(subjectId);
    if (!subject) {
      return res.status(404).json({ message: "Không tìm thấy môn học" });
    }

    if (subject.facultyId.toString() !== facultyId) {
      return res
        .status(400)
        .json({ message: "Môn học không thuộc khoa đã chọn" });
    }

    if (title !== undefined) document.title = title;
    if (description !== undefined) document.description = description;
    if (facultyId) document.facultyId = facultyId;
    if (subjectId) document.subjectId = subjectId;
    if (categoryId) document.categoryId = categoryId;

    const mainFile = req.files?.file?.[0];
    const coverImage = req.files?.coverImage?.[0];

    if (mainFile) {
      const uploadedFile = await uploadRawToCloudinary(
        mainFile.buffer,
        mainFile.originalname
      );
      document.fileUrl = uploadedFile.secure_url;
      document.fileType = mainFile.mimetype;
      document.cloudPublicId = uploadedFile.public_id;
      document.previewUrl =
        mainFile.mimetype === "application/pdf" ? uploadedFile.secure_url : "";
    }

    if (coverImage) {
      const uploadedCover = await uploadImageToCloudinary(
        coverImage.buffer,
        coverImage.originalname
      );
      document.coverImageUrl = uploadedCover.secure_url;
    }

    document.status = "pending";
    await document.save();

    res.json({
      message:
        "Cập nhật tài liệu thành công. Tài liệu đã được chuyển về trạng thái chờ duyệt",
      document,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteMyDocument = async (req, res) => {
  try {
    const document = await Document.findOne({
      _id: req.params.id,
      uploaderId: req.user._id,
    });

    if (!document) {
      return res
        .status(404)
        .json({ message: "Không tìm thấy tài liệu của bạn" });
    }

    await document.deleteOne();

    res.json({ message: "Xóa tài liệu thành công" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
