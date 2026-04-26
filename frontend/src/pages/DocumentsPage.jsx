// frontend/src/pages/DocumentsPage.jsx
import { useState, useEffect, useCallback } from "react";
import { getMyDocuments } from "../api/documentAPI";
import DocumentUpload from "../components/Documents/DocumentUpload";
import DocumentViewer from "../components/Documents/DocumentViewer";
import Sidebar from "../components/Shared/Sidebar";
import Navbar from "../components/Shared/Navbar";
import useAuth from "../hooks/useAuth";
import toast from "react-hot-toast";

const STATUS_BADGE = {
  draft:        "bg-slate-500/20  text-slate-400  border-slate-500/30",
  under_review: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  signed:       "bg-green-500/20  text-green-400  border-green-500/30",
  rejected:     "bg-red-500/20    text-red-400    border-red-500/30",
};

const FILE_ICON = (type) => {
  if (type === "application/pdf") return "📕";
  if (type?.startsWith("image/")) return "🖼️";
  return "📄";
};

const FILTERS = ["all", "draft", "under_review", "signed", "rejected"];

const DocumentsPage = () => {
  const { user } = useAuth();
  const [docs,        setDocs]        = useState([]);
  const [filter,      setFilter]      = useState("all");
  const [loading,     setLoading]     = useState(true);
  const [showUpload,  setShowUpload]  = useState(false);
  const [selectedDoc, setSelectedDoc] = useState(null);

  const fetchDocs = useCallback(async () => {
    setLoading(true);
    try {
      const params = filter !== "all" ? { status: filter } : {};
      const res = await getMyDocuments(params);
      setDocs(res.data.data);
    } catch {
      toast.error("Failed to load documents.");
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => { fetchDocs(); }, [fetchDocs]);

  const formatSize = (bytes) => {
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="min-h-screen bg-slate-900 flex">
      <Sidebar />

      <div className="flex-1 md:ml-64 flex flex-col min-h-screen">
        <Navbar title="Documents" />

        <main className="flex-1 overflow-y-auto p-4 md:p-6">

          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-white">Document Chamber</h1>
              <p className="text-slate-400 text-sm mt-1">Upload, manage and sign your documents</p>
            </div>
            <button
              onClick={() => setShowUpload(true)}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-medium transition-colors whitespace-nowrap self-start sm:self-auto"
            >
              + Upload Document
            </button>
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-2 mb-6 flex-wrap">
            {FILTERS.map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-lg text-sm capitalize transition-colors ${
                  filter === f
                    ? "bg-indigo-600 text-white"
                    : "bg-slate-800 text-slate-400 hover:text-white border border-slate-700"
                }`}
              >
                {f.replace("_", " ")}
              </button>
            ))}
          </div>

          {/* Content */}
          {loading ? (
            <div className="flex justify-center items-center h-48">
              <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : docs.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-5xl mb-4">📁</p>
              <p className="text-slate-400 text-lg">No documents found.</p>
              <p className="text-slate-500 text-sm mt-1">Click "Upload Document" to get started.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {docs.map((doc) => (
                <div
                  key={doc._id}
                  onClick={() => setSelectedDoc(doc)}
                  className="bg-slate-800 border border-slate-700 rounded-xl p-4 cursor-pointer hover:border-indigo-500/50 transition-all duration-200 group"
                >
                  {/* Icon + Title */}
                  <div className="flex items-start gap-3 mb-3">
                    <span className="text-3xl">{FILE_ICON(doc.fileType)}</span>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-white font-semibold text-sm truncate group-hover:text-indigo-300 transition-colors">
                        {doc.title}
                      </h3>
                      <p className="text-slate-500 text-xs truncate">{doc.fileName}</p>
                    </div>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full border shrink-0 ${STATUS_BADGE[doc.status]}`}>
                      {doc.status.replace("_", " ")}
                    </span>
                  </div>

                  {/* Description */}
                  {doc.description && (
                    <p className="text-slate-400 text-xs mb-3 line-clamp-2">{doc.description}</p>
                  )}

                  {/* Meta */}
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>👤 {doc.uploadedBy.name}</span>
                    <span>{formatSize(doc.fileSize)}</span>
                  </div>

                  {/* Signature badge */}
                  {doc.signature?.image && (
                    <div className="mt-2 flex items-center gap-1 text-xs text-green-400">
                      <span>✅</span>
                      <span>Signed</span>
                    </div>
                  )}

                  <p className="text-slate-600 text-xs mt-2">
                    {new Date(doc.createdAt).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>

      {/* Upload Modal */}
      {showUpload && (
        <DocumentUpload
          onClose={() => setShowUpload(false)}
          onSuccess={fetchDocs}
        />
      )}

      {/* Document Viewer */}
      {selectedDoc && (
        <DocumentViewer
          doc={selectedDoc}
          currentUserId={user?._id}
          onRefresh={fetchDocs}
          onClose={() => setSelectedDoc(null)}
        />
      )}
    </div>
  );
};

export default DocumentsPage;