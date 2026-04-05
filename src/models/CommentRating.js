import mongoose from "mongoose";

const commentRatingSchema = new mongoose.Schema(
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
    comment: { type: String, default: "" },
    rating: { type: Number, min: 1, max: 5 },
  },
  { timestamps: true }
);

const CommentRating = mongoose.model("CommentRating", commentRatingSchema);
export default CommentRating;
