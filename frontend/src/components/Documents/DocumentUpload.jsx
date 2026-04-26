// frontend/src/components/Documents/DocumentUpload.jsx
import { useState } from "react";
import { uploadDocument } from "../../api/documentAPI";
import toast from "react-hot-toast";

const DocumentUpload = ({ onClose, onSuccess }) => {
  const [file,        setFile]        = useState(null);
  const [title,       setTitle]       = useState("");
  const [description, setDescription] = useState("");
  const [loading,     setLoading]     = useState(false);
  const [dragOver,    setDragOver]    = useState(false);

  const handleFile = (f) => {
    if (!f) return;
    const allowed = ["application/pdf", "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "image/jpeg", "image/png"];
    if (!allowed.includes(f.type)) {
      return toast.error("Only PDF, Word, or image files allowed.");
    }
    if (f.size > 10 * 1024 * 1024) {
      return toast.error("File must be under 10MB.");
    }
    setFile(f);
    if (!title) setTitle(f.name.replace(/\.[^/.]+$/, ""));
  };

  const onDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    handleFile(e.dataTransfer.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file)  return toast.error("Please select a file.");
    if (!title) return toast.error("Title is required.");

    const formData = new FormData();
    formData.append("file",        file);
    formData.append("title",       title);
    formData.append("description", description);

    setLoading(true);
    try {
      await uploadDocument(formData);
      toast.success("Document uploaded!");
      onSuccess();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || "Upload failed.");
    } finally {
      setLoading(false);
    }
  };

  const formatSize = (bytes) => {
    if (bytes < 1024)        return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
      <div className="bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-md p-6 shadow-2xl">

        <div className="flex items-center justify-between mb-5">
          <h2 className="text-white text-lg font-bold">📄 Upload Document</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white text-xl">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Drop Zone */}
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={onDrop}
            onClick={() => document.getElementById("fileInput").click()}
            className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${
              dragOver
                ? "border-indigo-500 bg-indigo-500/10"
                : file
                ? "border-green-500 bg-green-500/10"
                : "border-slate-600 hover:border-slate-500"
            }`}
          >
            <input
              id="fileInput"
              type="file"
              className="hidden"
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
              onChange={(e) => handleFile(e.target.files[0])}
            />
            {file ? (
              <div>
                <p className="text-2xl mb-1">✅</p>
                <p className="text-green-400 text-sm font-medium">{file.name}</p>
                <p className="text-slate-400 text-xs mt-1">{formatSize(file.size)}</p>
              </div>
            ) : (
              <div>
                <p className="text-3xl mb-2">📁</p>
                <p className="text-slate-300 text-sm">Drop file here or click to browse</p>
                <p className="text-slate-500 text-xs mt-1">PDF, Word, JPG, PNG — Max 10MB</p>
              </div>
            )}
          </div>

          {/* Title */}
          <div>
            <label className="block text-slate-300 text-sm mb-1">Title *</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Document title"
              className="w-full bg-slate-700 border border-slate-600 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-slate-300 text-sm mb-1">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              placeholder="Optional description..."
              className="w-full bg-slate-700 border border-slate-600 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500 resize-none"
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 border border-slate-600 text-slate-300 hover:text-white rounded-lg text-sm transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-lg text-sm font-medium transition-colors"
            >
              {loading ? "Uploading..." : "Upload"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DocumentUpload;