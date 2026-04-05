import mongoose from "mongoose";

const downloadSchema = new mongoose.Schema(
  {
    documentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Document",
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    downloadedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const Download = mongoose.model("Download", downloadSchema);
export default Download;
