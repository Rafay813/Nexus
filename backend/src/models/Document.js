// backend/src/models/Document.js
const mongoose = require("mongoose");

const documentSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Document title is required"],
      trim: true,
    },
    description: {
      type: String,
      default: "",
      trim: true,
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    sharedWith: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    fileName:   { type: String, required: true },
    fileUrl:    { type: String, required: true },   // Cloudinary URL
    publicId:   { type: String, default: "" },      // Cloudinary public_id for deletion
    fileType:   { type: String, required: true },
    fileSize:   { type: Number, required: true },
    version:    { type: Number, default: 1 },
    status: {
      type: String,
      enum: ["draft", "under_review", "signed", "rejected"],
      default: "draft",
    },
    signature: {
      image:    { type: String, default: null },
      signedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
      signedAt: { type: Date, default: null },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Document", documentSchema);