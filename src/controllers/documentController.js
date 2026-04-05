import streamifier from "streamifier";
import cloudinary from "../config/cloudinary.js";
import Document from "../models/Document.js";
import Download from "../models/Download.js";
import CommentRating from "../models/CommentRating.js";
import Subject from "../models/Subject.js";

const uploadRawToCloudinary = (buffer, originalname) =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        resource_type: "raw",
        folder: "tai-lieu-hoc-tap/files",
        public_id: `${Date.now()}-${originalname}`,
        access_mode: "public",
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

export const createDocument = async (req, res) => {
  try {
    const { title, description, facultyId, subjectId, categoryId } = req.body;

    const mainFile = req.files?.file?.[0];
    const coverImage = req.files?.coverImage?.[0];

    if (!title || !facultyId || !subjectId || !categoryId || !mainFile) {
      return res.status(400).json({
        message: "Vui lòng nhập tiêu đề, khoa, môn học, danh mục và chọn file",
      });
    }

    const subject = await Subject.findById(subjectId);
    if (!subject) {
      return res.status(404).json({ message: "Không tìm thấy môn học" });
    }

    if (subject.facultyId.toString() !== facultyId) {
      return res.status(400).json({
        message: "Môn học không thuộc khoa đã chọn",
      });
    }

    const uploadedFile = await uploadRawToCloudinary(
      mainFile.buffer,
      mainFile.originalname
    );

    let coverImageUrl = "";
    if (coverImage) {
      const uploadedCover = await uploadImageToCloudinary(
        coverImage.buffer,
        coverImage.originalname
      );
      coverImageUrl = uploadedCover.secure_url;
    }

    const isPdf = mainFile.mimetype === "application/pdf";

    const document = await Document.create({
      title,
      description: description || "",
      fileUrl: uploadedFile.secure_url,
      fileType: mainFile.mimetype,
      cloudPublicId: uploadedFile.public_id,
      coverImageUrl,
      previewUrl: isPdf ? uploadedFile.secure_url : "",
      uploaderId: req.user._id,
      facultyId,
      subjectId,
      categoryId,
      status: "pending",
    });

    res.status(201).json({
      message: "Tải lên thành công, tài liệu đang chờ quản trị viên duyệt",
      document,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getApprovedDocuments = async (req, res) => {
  try {
    const {
      q = "",
      facultyId = "",
      subjectId = "",
      categoryId = "",
    } = req.query;

    const filter = {
      status: "approved",
      title: { $regex: q, $options: "i" },
    };

    if (facultyId) filter.facultyId = facultyId;
    if (subjectId) filter.subjectId = subjectId;
    if (categoryId) filter.categoryId = categoryId;

    const documents = await Document.find(filter)
      .populate("uploaderId", "fullName username avatarUrl")
      .populate("facultyId", "name")
      .populate("subjectId", "subjectCode subjectName")
      .populate("categoryId", "name")
      .sort({ createdAt: -1 });

    res.json(documents);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getDocumentDetail = async (req, res) => {
  try {
    const document = await Document.findById(req.params.id)
      .populate("uploaderId", "fullName username avatarUrl")
      .populate("facultyId", "name")
      .populate("subjectId", "subjectCode subjectName")
      .populate("categoryId", "name");

    if (!document) {
      return res.status(404).json({ message: "Không tìm thấy tài liệu" });
    }

    const comments = await CommentRating.find({ documentId: document._id })
      .populate("userId", "fullName username avatarUrl")
      .sort({ createdAt: -1 });

    res.json({ document, comments });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const downloadDocument = async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);

    if (!document || document.status !== "approved") {
      return res.status(404).json({ message: "Tài liệu không khả dụng" });
    }

    document.downloadCount += 1;
    await document.save();

    await Download.create({
      documentId: document._id,
      userId: req.user._id,
    });

    res.json({
      message: "Lấy link tải thành công",
      fileUrl: document.fileUrl,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const addCommentRating = async (req, res) => {
  try {
    const { comment, rating } = req.body;

    if (!rating) {
      return res.status(400).json({ message: "Vui lòng chọn số sao đánh giá" });
    }

    const data = await CommentRating.create({
      documentId: req.params.id,
      userId: req.user._id,
      comment: comment || "",
      rating,
    });

    res.status(201).json({
      message: "Gửi đánh giá thành công",
      data,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
