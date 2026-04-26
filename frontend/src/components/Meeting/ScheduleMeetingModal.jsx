// frontend/src/components/Meeting/ScheduleMeetingModal.jsx
import { useState, useEffect } from "react";
import { getAllUsers, scheduleMeeting } from "../../api/meetingAPI";
import toast from "react-hot-toast";

const ScheduleMeetingModal = ({ onClose, onSuccess }) => {
  const [users, setUsers]   = useState([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: "", description: "", attendeeId: "",
    date: "", startTime: "", endTime: "", notes: "",
  });

  useEffect(() => {
    getAllUsers()
      .then((res) => setUsers(res.data.data))
      .catch(() => toast.error("Could not load users."));
  }, []);

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.attendeeId || !form.date || !form.startTime || !form.endTime) {
      return toast.error("Please fill all required fields.");
    }
    setLoading(true);
    try {
      await scheduleMeeting(form);
      toast.success("Meeting scheduled!");
      onSuccess();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to schedule meeting.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
      <div className="bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-lg p-6 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-white text-lg font-bold">📅 Schedule Meeting</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white text-xl">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div>
            <label className="block text-slate-300 text-sm mb-1">Title *</label>
            <input
              name="title" value={form.title} onChange={handleChange}
              placeholder="e.g. Investment Discussion"
              className="w-full bg-slate-700 border border-slate-600 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-slate-300 text-sm mb-1">Description</label>
            <textarea
              name="description" value={form.description} onChange={handleChange}
              rows={2} placeholder="What's this meeting about?"
              className="w-full bg-slate-700 border border-slate-600 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500 resize-none"
            />
          </div>

          {/* Attendee */}
          <div>
            <label className="block text-slate-300 text-sm mb-1">Invite *</label>
            <select
              name="attendeeId" value={form.attendeeId} onChange={handleChange}
              className="w-full bg-slate-700 border border-slate-600 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500"
            >
              <option value="">— Select a user —</option>
              {users.map((u) => (
                <option key={u._id} value={u._id}>
                  {u.name} ({u.role})
                </option>
              ))}
            </select>
          </div>

          {/* Date */}
          <div>
            <label className="block text-slate-300 text-sm mb-1">Date *</label>
            <input
              type="date" name="date" value={form.date} onChange={handleChange}
              min={new Date().toISOString().split("T")[0]}
              className="w-full bg-slate-700 border border-slate-600 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Time */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 text-sm mb-1">Start Time *</label>
              <input
                type="time" name="startTime" value={form.startTime} onChange={handleChange}
                className="w-full bg-slate-700 border border-slate-600 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-slate-300 text-sm mb-1">End Time *</label>
              <input
                type="time" name="endTime" value={form.endTime} onChange={handleChange}
                className="w-full bg-slate-700 border border-slate-600 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-slate-300 text-sm mb-1">Notes</label>
            <textarea
              name="notes" value={form.notes} onChange={handleChange}
              rows={2} placeholder="Any extra notes..."
              className="w-full bg-slate-700 border border-slate-600 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500 resize-none"
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              type="button" onClick={onClose}
              className="flex-1 py-2 border border-slate-600 text-slate-300 hover:text-white rounded-lg text-sm transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit" disabled={loading}
              className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
            >
              {loading ? "Scheduling..." : "Schedule Meeting"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ScheduleMeetingModal;