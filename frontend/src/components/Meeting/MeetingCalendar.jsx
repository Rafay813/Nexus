// frontend/src/components/Meeting/MeetingCalendar.jsx
import { useState, useEffect, useCallback } from "react";
import { getMyMeetings } from "../../api/meetingAPI";
import toast from "react-hot-toast";

const STATUS_COLORS = {
  pending:   "bg-yellow-500",
  accepted:  "bg-green-500",
  rejected:  "bg-red-500",
  cancelled: "bg-gray-500",
};

const STATUS_BADGE = {
  pending:   "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  accepted:  "bg-green-500/20  text-green-400  border-green-500/30",
  rejected:  "bg-red-500/20    text-red-400    border-red-500/30",
  cancelled: "bg-gray-500/20   text-gray-400   border-gray-500/30",
};

const DAYS   = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];

const MeetingCalendar = ({ onScheduleClick }) => {
  const today = new Date();

  const [currentYear,  setCurrentYear]  = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [meetings,     setMeetings]     = useState([]);
  const [selectedDay,  setSelectedDay]  = useState(null);
  const [loading,      setLoading]      = useState(true);

  // ── Fetch all meetings once ───────────────────────────────────────────────
  const fetchMeetings = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getMyMeetings();
      setMeetings(res.data.data);
    } catch {
      toast.error("Failed to load calendar meetings.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchMeetings(); }, [fetchMeetings]);

  // ── Calendar math ─────────────────────────────────────────────────────────
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
  const daysInMonth     = new Date(currentYear, currentMonth + 1, 0).getDate();

  const prevMonth = () => {
    if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear((y) => y - 1); }
    else setCurrentMonth((m) => m - 1);
    setSelectedDay(null);
  };

  const nextMonth = () => {
    if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear((y) => y + 1); }
    else setCurrentMonth((m) => m + 1);
    setSelectedDay(null);
  };

  // ── Meetings grouped by "YYYY-MM-DD" key ─────────────────────────────────
  const meetingsByDate = meetings.reduce((acc, m) => {
    const key = new Date(m.date).toISOString().split("T")[0];
    if (!acc[key]) acc[key] = [];
    acc[key].push(m);
    return acc;
  }, {});

  const getKey = (day) => {
    const mm = String(currentMonth + 1).padStart(2, "0");
    const dd = String(day).padStart(2, "0");
    return `${currentYear}-${mm}-${dd}`;
  };

  const selectedMeetings = selectedDay ? (meetingsByDate[getKey(selectedDay)] || []) : [];

  const isToday = (day) =>
    day === today.getDate() &&
    currentMonth === today.getMonth() &&
    currentYear  === today.getFullYear();

  // ── Build grid cells ──────────────────────────────────────────────────────
  const cells = [];
  for (let i = 0; i < firstDayOfMonth; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="bg-slate-800 border border-slate-700 rounded-2xl overflow-hidden">

      {/* ── Header ── */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700">
        <button
          onClick={prevMonth}
          className="text-slate-400 hover:text-white px-2 py-1 rounded-lg hover:bg-slate-700 transition-colors text-lg"
        >
          ‹
        </button>
        <h2 className="text-white font-bold text-base">
          {MONTHS[currentMonth]} {currentYear}
        </h2>
        <button
          onClick={nextMonth}
          className="text-slate-400 hover:text-white px-2 py-1 rounded-lg hover:bg-slate-700 transition-colors text-lg"
        >
          ›
        </button>
      </div>

      <div className="p-4">
        {/* ── Day labels ── */}
        <div className="grid grid-cols-7 mb-2">
          {DAYS.map((d) => (
            <div key={d} className="text-center text-xs font-medium text-slate-500 py-1">
              {d}
            </div>
          ))}
        </div>

        {/* ── Calendar grid ── */}
        {loading ? (
          <div className="flex justify-center items-center h-40">
            <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-7 gap-1">
            {cells.map((day, idx) => {
              if (!day) return <div key={`empty-${idx}`} />;

              const key      = getKey(day);
              const dayMeets = meetingsByDate[key] || [];
              const hasAny   = dayMeets.length > 0;
              const selected = selectedDay === day;
              const todayDay = isToday(day);

              return (
                <button
                  key={key}
                  onClick={() => setSelectedDay(selected ? null : day)}
                  className={`
                    relative flex flex-col items-center justify-start
                    rounded-xl p-1.5 min-h-[52px] transition-all duration-150
                    ${selected
                      ? "bg-indigo-600 text-white ring-2 ring-indigo-400"
                      : todayDay
                      ? "bg-indigo-500/20 text-indigo-300 ring-1 ring-indigo-500"
                      : hasAny
                      ? "bg-slate-700/60 text-white hover:bg-slate-700"
                      : "text-slate-400 hover:bg-slate-700/50 hover:text-white"
                    }
                  `}
                >
                  <span className="text-xs font-semibold">{day}</span>

                  {/* Dots for meetings */}
                  {hasAny && (
                    <div className="flex gap-0.5 mt-1 flex-wrap justify-center">
                      {dayMeets.slice(0, 3).map((m) => (
                        <span
                          key={m._id}
                          className={`w-1.5 h-1.5 rounded-full ${STATUS_COLORS[m.status]}`}
                        />
                      ))}
                      {dayMeets.length > 3 && (
                        <span className="text-[9px] text-slate-300">+{dayMeets.length - 3}</span>
                      )}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        )}

        {/* ── Legend ── */}
        <div className="flex gap-3 flex-wrap mt-4 pt-3 border-t border-slate-700">
          {Object.entries(STATUS_COLORS).map(([s, color]) => (
            <div key={s} className="flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${color}`} />
              <span className="text-xs text-slate-400 capitalize">{s}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Selected Day Panel ── */}
      {selectedDay && (
        <div className="border-t border-slate-700 px-4 pb-4 pt-3">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-white font-semibold text-sm">
              📅 {MONTHS[currentMonth]} {selectedDay}, {currentYear}
            </h3>
            {onScheduleClick && (
              <button
                onClick={onScheduleClick}
                className="text-xs px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors"
              >
                + Schedule
              </button>
            )}
          </div>

          {selectedMeetings.length === 0 ? (
            <p className="text-slate-500 text-sm text-center py-4">
              No meetings on this day.
            </p>
          ) : (
            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {selectedMeetings.map((m) => (
                <div
                  key={m._id}
                  className="bg-slate-700/60 border border-slate-600 rounded-xl p-3 flex items-start gap-3"
                >
                  {/* Color bar */}
                  <div className={`w-1 self-stretch rounded-full ${STATUS_COLORS[m.status]}`} />

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-white text-sm font-medium truncate">{m.title}</p>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full border shrink-0 ${STATUS_BADGE[m.status]}`}>
                        {m.status}
                      </span>
                    </div>
                    <p className="text-slate-400 text-xs mt-0.5">
                      🕐 {m.startTime} – {m.endTime}
                    </p>
                    <p className="text-slate-500 text-xs mt-0.5 truncate">
                      👤 {m.organizer?.name} → 👥 {m.attendee?.name}
                    </p>
                    {m.description && (
                      <p className="text-slate-400 text-xs mt-1 italic truncate">{m.description}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MeetingCalendar;