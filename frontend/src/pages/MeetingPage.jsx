import { useState, useEffect, useCallback } from "react";
import { getMyMeetings } from "../api/meetingAPI";
import MeetingCard from "../components/Meeting/MeetingCard";
import MeetingCalendar from "../components/Meeting/MeetingCalendar";
import ScheduleMeetingModal from "../components/Meeting/ScheduleMeetingModal";
import Sidebar from "../components/Shared/Sidebar";
import Navbar from "../components/Shared/Navbar";
import useAuth from "../hooks/useAuth";
import toast from "react-hot-toast";

const FILTERS = ["all", "pending", "accepted", "rejected", "cancelled"];

const MeetingPage = () => {
  const { user } = useAuth();
  const [meetings,  setMeetings]  = useState([]);
  const [filter,    setFilter]    = useState("all");
  const [loading,   setLoading]   = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [activeTab, setActiveTab] = useState("list");

  const fetchMeetings = useCallback(async () => {
    setLoading(true);
    try {
      const params = filter !== "all" ? { status: filter } : {};
      const res = await getMyMeetings(params);
      setMeetings(res.data.data);
    } catch {
      toast.error("Failed to load meetings.");
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => { fetchMeetings(); }, [fetchMeetings]);

  return (
    <div className="min-h-screen bg-slate-900 flex">
      <Sidebar />
      <div className="flex-1 md:ml-64 flex flex-col min-h-screen">
        <Navbar title="Meetings" />
        <main className="flex-1 overflow-y-auto p-4 md:p-6">

          {/* ── Page Header ── */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-white">Meetings</h1>
              <p className="text-slate-400 text-sm mt-1">Schedule and manage your meetings</p>
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="px-3 md:px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-medium transition-colors whitespace-nowrap"
            >
              + Schedule Meeting
            </button>
          </div>

          {/* ── View Tabs ── */}
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setActiveTab("list")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === "list"
                  ? "bg-indigo-600 text-white"
                  : "bg-slate-800 text-slate-400 hover:text-white border border-slate-700"
              }`}
            >
              📋 List View
            </button>
            <button
              onClick={() => setActiveTab("calendar")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === "calendar"
                  ? "bg-indigo-600 text-white"
                  : "bg-slate-800 text-slate-400 hover:text-white border border-slate-700"
              }`}
            >
              📅 Calendar View
            </button>
          </div>

          {/* ── Calendar View ── */}
          {activeTab === "calendar" && (
            <div className="max-w-lg">
              <MeetingCalendar onScheduleClick={() => setShowModal(true)} />
            </div>
          )}

          {/* ── List View ── */}
          {activeTab === "list" && (
            <>
              <div className="flex gap-2 mb-5 flex-wrap">
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
                    {f}
                  </button>
                ))}
              </div>

              {loading ? (
                <div className="flex justify-center items-center h-48">
                  <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : meetings.length === 0 ? (
                <div className="text-center py-20">
                  <p className="text-5xl mb-4">📅</p>
                  <p className="text-slate-400 text-lg">No meetings found.</p>
                  <p className="text-slate-500 text-sm mt-1">Click "Schedule Meeting" to get started.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {meetings.map((m) => (
                    <MeetingCard
                      key={m._id}
                      meeting={m}
                      currentUserId={user?._id}
                      onRefresh={fetchMeetings}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </main>
      </div>

      {showModal && (
        <ScheduleMeetingModal
          onClose={() => setShowModal(false)}
          onSuccess={fetchMeetings}
        />
      )}
    </div>
  );
};

export default MeetingPage;