// backend/src/controllers/documentController.js
const Document   = require("../models/Document");
const cloudinary = require("../config/cloudinary");

// ── Helper: upload buffer to Cloudinary ───────────────────────────────────────
const uploadToCloudinary = (buffer, mimetype, originalname) => {
  return new Promise((resolve, reject) => {
    const isImage     = mimetype.startsWith("image/");
    const resourceType = isImage ? "image" : "raw";
    const publicId    = `nexus/documents/${Date.now()}-${originalname.replace(/\s+/g, "_")}`;

    const stream = cloudinary.uploader.upload_stream(
      { resource_type: resourceType, public_id: publicId },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );
    stream.end(buffer);
  });
};

// ── @POST /api/documents ──────────────────────────────────────────────────────
const uploadDocument = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No file uploaded." });
    }

    const { title, description, sharedWith } = req.body;

    if (!title) {
      return res.status(400).json({ success: false, message: "Title is required." });
    }

    // Upload buffer to Cloudinary
    const result = await uploadToCloudinary(
      req.file.buffer,
      req.file.mimetype,
      req.file.originalname
    );

    const doc = await Document.create({
      title,
      description,
      uploadedBy: req.user._id,
      sharedWith: sharedWith ? JSON.parse(sharedWith) : [],
      fileName:   req.file.originalname,
      fileUrl:    result.secure_url,   // Cloudinary public URL
      publicId:   result.public_id,    // for deletion
      fileType:   req.file.mimetype,
      fileSize:   req.file.size,
    });

    await doc.populate("uploadedBy", "name email role");

    res.status(201).json({ success: true, message: "Document uploaded.", data: doc });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── @GET /api/documents — All docs visible to everyone ───────────────────────
const getMyDocuments = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = {};
    if (status) filter.status = status;

    const docs = await Document.find(filter)
      .populate("uploadedBy", "name email role")
      .populate("sharedWith", "name email role")
      .populate("signature.signedBy", "name email")
      .sort({ createdAt: -1 });

    res.json({ success: true, count: docs.length, data: docs });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── @GET /api/documents/:id ───────────────────────────────────────────────────
const getDocumentById = async (req, res) => {
  try {
    const doc = await Document.findById(req.params.id)
      .populate("uploadedBy", "name email role")
      .populate("sharedWith", "name email role")
      .populate("signature.signedBy", "name email");

    if (!doc) {
      return res.status(404).json({ success: false, message: "Document not found." });
    }

    res.json({ success: true, data: doc });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── @PATCH /api/documents/:id/status ─────────────────────────────────────────
const updateDocumentStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const allowed = ["draft", "under_review", "signed", "rejected"];

    if (!allowed.includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid status." });
    }

    const doc = await Document.findById(req.params.id);
    if (!doc) {
      return res.status(404).json({ success: false, message: "Document not found." });
    }

    if (doc.uploadedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Only the uploader can update status." });
    }

    doc.status = status;
    await doc.save();

    res.json({ success: true, message: `Status updated to ${status}.`, data: doc });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── @POST /api/documents/:id/sign ────────────────────────────────────────────
const signDocument = async (req, res) => {
  try {
    const { signatureImage } = req.body;

    if (!signatureImage) {
      return res.status(400).json({ success: false, message: "Signature image is required." });
    }

    const doc = await Document.findById(req.params.id);
    if (!doc) {
      return res.status(404).json({ success: false, message: "Document not found." });
    }

    doc.signature = {
      image:    signatureImage,
      signedBy: req.user._id,
      signedAt: new Date(),
    };
    doc.status = "signed";
    await doc.save();
    await doc.populate("signature.signedBy", "name email");

    res.json({ success: true, message: "Document signed successfully.", data: doc });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── @DELETE /api/documents/:id ────────────────────────────────────────────────
const deleteDocument = async (req, res) => {
  try {
    const doc = await Document.findById(req.params.id);
    if (!doc) {
      return res.status(404).json({ success: false, message: "Document not found." });
    }

    if (doc.uploadedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Only the uploader can delete." });
    }

    // Delete from Cloudinary
    if (doc.publicId) {
      const isImage = doc.fileType?.startsWith("image/");
      await cloudinary.uploader.destroy(doc.publicId, {
        resource_type: isImage ? "image" : "raw",
      });
    }

    await doc.deleteOne();
    res.json({ success: true, message: "Document deleted." });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  uploadDocument,
  getMyDocuments,
  getDocumentById,
  updateDocumentStatus,
  signDocument,
  deleteDocument,
};
