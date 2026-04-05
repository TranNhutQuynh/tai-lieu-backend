import mongoose from "mongoose";

const subjectSchema = new mongoose.Schema(
  {
    subjectCode: { type: String, required: true, unique: true },
    subjectName: { type: String, required: true },
    facultyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Faculty",
      required: true,
    },
    credit: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.model("Subject", subjectSchema);
