// backend/src/routes/documentRoutes.js
const express  = require("express");
const router   = express.Router();
const upload   = require("../middleware/uploadMiddleware");
const { protect } = require("../middleware/auth.middleware");

const {
  uploadDocument,
  getMyDocuments,
  getDocumentById,
  updateDocumentStatus,
  signDocument,
  deleteDocument,
} = require("../controllers/documentController");

router.use(protect);

router.post(   "/",           upload.single("file"), uploadDocument);    // POST   /api/documents
router.get(    "/",           getMyDocuments);                           // GET    /api/documents
router.get(    "/:id",        getDocumentById);                          // GET    /api/documents/:id
router.patch(  "/:id/status", updateDocumentStatus);                     // PATCH  /api/documents/:id/status
router.post(   "/:id/sign",   signDocument);                             // POST   /api/documents/:id/sign
router.delete( "/:id",        deleteDocument);                           // DELETE /api/documents/:id

module.exports = router;