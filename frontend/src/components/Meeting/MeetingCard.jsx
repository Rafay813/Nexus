// frontend/src/components/Meeting/MeetingCard.jsx
import { useState } from "react";
import { updateMeetingStatus, deleteMeeting } from "../../api/meetingAPI";
import toast from "react-hot-toast";

const statusColors = {
  pending:   "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  accepted:  "bg-green-500/20  text-green-400  border-green-500/30",
  rejected:  "bg-red-500/20    text-red-400    border-red-500/30",
  cancelled: "bg-gray-500/20   text-gray-400   border-gray-500/30",
};

const MeetingCard = ({ meeting, currentUserId, onRefresh }) => {
  const [loading, setLoading] = useState(false);

  const isOrganizer = meeting.organizer._id === currentUserId;
  const isAttendee  = meeting.attendee._id  === currentUserId;

  const handleStatus = async (status) => {
    setLoading(true);
    try {
      await updateMeetingStatus(meeting._id, status);
      toast.success(`Meeting ${status}!`);
      onRefresh();
    } catch (err) {
      toast.error(err.response?.data?.message || "Action failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Delete this meeting?")) return;
    setLoading(true);
    try {
      await deleteMeeting(meeting._id);
      toast.success("Meeting deleted.");
      onRefresh();
    } catch (err) {
      toast.error(err.response?.data?.message || "Delete failed.");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (d) =>
    new Date(d).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" });

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-xl p-5 hover:border-indigo-500/50 transition-all duration-200">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <h3 className="text-white font-semibold text-base">{meeting.title}</h3>
        <span className={`text-xs px-2 py-1 rounded-full border font-medium ${statusColors[meeting.status]}`}>
          {meeting.status.charAt(0).toUpperCase() + meeting.status.slice(1)}
        </span>
      </div>

      {/* Description */}
      {meeting.description && (
        <p className="text-slate-400 text-sm mb-3">{meeting.description}</p>
      )}

      {/* Date & Time */}
      <div className="flex items-center gap-4 text-sm text-slate-300 mb-3">
        <span>📅 {formatDate(meeting.date)}</span>
        <span>🕐 {meeting.startTime} – {meeting.endTime}</span>
      </div>

      {/* Organizer / Attendee */}
      <div className="flex gap-4 text-xs text-slate-400 mb-4">
        <span>👤 Organizer: <span className="text-slate-200">{meeting.organizer.name}</span></span>
        <span>👥 Attendee: <span className="text-slate-200">{meeting.attendee.name}</span></span>
      </div>

      {/* Notes */}
      {meeting.notes && (
        <p className="text-xs text-slate-500 italic mb-3">📝 {meeting.notes}</p>
      )}

      {/* Actions */}
      <div className="flex gap-2 flex-wrap">
        {/* Attendee can accept/reject pending meetings */}
        {isAttendee && meeting.status === "pending" && (
          <>
            <button
              onClick={() => handleStatus("accepted")}
              disabled={loading}
              className="px-3 py-1.5 bg-green-600 hover:bg-green-500 text-white text-xs rounded-lg transition-colors disabled:opacity-50"
            >
              ✓ Accept
            </button>
            <button
              onClick={() => handleStatus("rejected")}
              disabled={loading}
              className="px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white text-xs rounded-lg transition-colors disabled:opacity-50"
            >
              ✕ Reject
            </button>
          </>
        )}

        {/* Organizer can cancel accepted/pending meetings */}
        {isOrganizer && ["pending", "accepted"].includes(meeting.status) && (
          <button
            onClick={() => handleStatus("cancelled")}
            disabled={loading}
            className="px-3 py-1.5 bg-orange-600 hover:bg-orange-500 text-white text-xs rounded-lg transition-colors disabled:opacity-50"
          >
            ⊘ Cancel
          </button>
        )}

        {/* Organizer can delete */}
        {isOrganizer && (
          <button
            onClick={handleDelete}
            disabled={loading}
            className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-white text-xs rounded-lg transition-colors disabled:opacity-50"
          >
            🗑 Delete
          </button>
        )}
      </div>
    </div>
  );
};

export default MeetingCard;