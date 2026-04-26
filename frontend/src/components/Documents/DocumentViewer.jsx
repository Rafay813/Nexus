// frontend/src/components/Documents/DocumentViewer.jsx
import { useState } from "react";
import { updateDocumentStatus, deleteDocument, signDocument } from "../../api/documentAPI";
import SignatureCanvas from "./SignatureCanvas";
import toast from "react-hot-toast";

const STATUS_BADGE = {
  draft:        "bg-slate-500/20  text-slate-400  border-slate-500/30",
  under_review: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  signed:       "bg-green-500/20  text-green-400  border-green-500/30",
  rejected:     "bg-red-500/20    text-red-400    border-red-500/30",
};

const DocumentViewer = ({ doc, currentUserId, onRefresh, onClose }) => {
  const [loading,     setLoading]     = useState(false);
  const [showSign,    setShowSign]    = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const isOwner = doc.uploadedBy._id === currentUserId;
  const isPDF   = doc.fileType === "application/pdf";
  const isImage = doc.fileType?.startsWith("image/");

  // Cloudinary URL used directly — no backend prefix needed
  const fileUrl = doc.fileUrl;

  const handleStatus = async (status) => {
    setLoading(true);
    try {
      await updateDocumentStatus(doc._id, status);
      toast.success(`Status updated to ${status}`);
      onRefresh();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Delete this document?")) return;
    setLoading(true);
    try {
      await deleteDocument(doc._id);
      toast.success("Document deleted.");
      onRefresh();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || "Delete failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleSign = async (signatureImage) => {
    setLoading(true);
    try {
      await signDocument(doc._id, signatureImage);
      toast.success("Document signed!");
      setShowSign(false);
      onRefresh();
    } catch (err) {
      toast.error(err.response?.data?.message || "Signing failed.");
    } finally {
      setLoading(false);
    }
  };

  const formatSize = (bytes) => {
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <>
      <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
        <div className="bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">

          {/* Header */}
          <div className="flex items-start justify-between p-5 border-b border-slate-700">
            <div className="flex-1 min-w-0 pr-4">
              <h2 className="text-white font-bold text-base truncate">{doc.title}</h2>
              <p className="text-slate-400 text-xs mt-0.5">{doc.fileName}</p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className={`text-xs px-2 py-1 rounded-full border ${STATUS_BADGE[doc.status]}`}>
                {doc.status.replace("_", " ")}
              </span>
              <button onClick={onClose} className="text-slate-400 hover:text-white text-xl">✕</button>
            </div>
          </div>

          {/* Body */}
          <div className="p-5 space-y-3">
            {doc.description && (
              <p className="text-slate-300 text-sm">{doc.description}</p>
            )}

            <div className="grid grid-cols-2 gap-3 text-xs text-slate-400">
              <div>👤 <span className="text-slate-200">{doc.uploadedBy.name}</span></div>
              <div>📦 <span className="text-slate-200">{formatSize(doc.fileSize)}</span></div>
              <div>🔖 Version <span className="text-slate-200">{doc.version}</span></div>
              <div>📅 <span className="text-slate-200">{new Date(doc.createdAt).toLocaleDateString()}</span></div>
            </div>

            {/* Uploader role badge */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">Uploaded by:</span>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${
                doc.uploadedBy.role === "investor"
                  ? "bg-emerald-900/60 text-emerald-400"
                  : "bg-indigo-900/60 text-indigo-400"
              }`}>
                {doc.uploadedBy.role}
              </span>
            </div>

            {/* Signature */}
            {doc.signature?.image && (
              <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-3">
                <p className="text-green-400 text-xs font-medium mb-2">✅ Signed</p>
                <img
                  src={doc.signature.image}
                  alt="Signature"
                  className="max-h-16 rounded border border-slate-600"
                />
                <p className="text-slate-400 text-xs mt-1">
                  By {doc.signature.signedBy?.name} · {new Date(doc.signature.signedAt).toLocaleDateString()}
                </p>
              </div>
            )}

            {/* Preview */}
            {(isPDF || isImage) && (
              <button
                onClick={() => setShowPreview(true)}
                className="w-full py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-sm transition-colors"
              >
                👁️ Preview Document
              </button>
            )}

            {/* Download */}
            <a
              href={fileUrl}
              download={doc.fileName}
              target="_blank"
              rel="noreferrer"
              className="block w-full py-2 text-center bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-sm transition-colors"
            >
              ⬇️ Download
            </a>

            {/* Actions */}
            <div className="flex flex-wrap gap-2 pt-1">
              {/* Any user can sign if not already signed */}
              {!doc.signature?.image && (
                <button
                  onClick={() => setShowSign(true)}
                  disabled={loading}
                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs rounded-lg transition-colors disabled:opacity-50"
                >
                  ✍️ Sign Document
                </button>
              )}

              {/* Status buttons — owner only */}
              {isOwner && doc.status === "draft" && (
                <button
                  onClick={() => handleStatus("under_review")}
                  disabled={loading}
                  className="px-3 py-1.5 bg-yellow-600 hover:bg-yellow-500 text-white text-xs rounded-lg transition-colors disabled:opacity-50"
                >
                  📋 Send for Review
                </button>
              )}

              {isOwner && doc.status === "under_review" && (
                <button
                  onClick={() => handleStatus("rejected")}
                  disabled={loading}
                  className="px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white text-xs rounded-lg transition-colors disabled:opacity-50"
                >
                  ✕ Reject
                </button>
              )}

              {/* Delete — owner only */}
              {isOwner && (
                <button
                  onClick={handleDelete}
                  disabled={loading}
                  className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-white text-xs rounded-lg transition-colors disabled:opacity-50"
                >
                  🗑️ Delete
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Signature Canvas */}
      {showSign && (
        <SignatureCanvas
          onSave={handleSign}
          onCancel={() => setShowSign(false)}
        />
      )}

      {/* Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700">
              <p className="text-white text-sm font-medium truncate">{doc.fileName}</p>
              <button onClick={() => setShowPreview(false)} className="text-slate-400 hover:text-white text-xl">✕</button>
            </div>
            <div className="flex-1 overflow-auto p-2">
              {isPDF && (
                <iframe
                  src={fileUrl}
                  title="PDF Preview"
                  className="w-full min-h-[60vh] rounded-lg"
                />
              )}
              {isImage && (
                <img
                  src={fileUrl}
                  alt={doc.title}
                  className="max-w-full mx-auto rounded-lg"
                />
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default DocumentViewer;