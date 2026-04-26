// frontend/src/pages/VideoCallPage.jsx
import { useState } from "react";
import VideoRoom from "../components/VideoCall/VideoRoom";
import Sidebar from "../components/Shared/Sidebar";
import Navbar from "../components/Shared/Navbar";
import useAuth from "../hooks/useAuth";

const VideoCallPage = () => {
  const { user } = useAuth();
  const [roomId, setRoomId] = useState("");
  const [input,  setInput]  = useState("");
  const [inCall, setInCall] = useState(false);

  const joinRoom = () => {
    const trimmed = input.trim();
    if (!trimmed) return;
    setRoomId(trimmed);
    setInCall(true);
  };

  const leaveCall = () => {
    setInCall(false);
    setRoomId("");
    setInput("");
  };

  return (
    <div className="min-h-screen bg-slate-900 flex">
      <Sidebar />

      <div className="flex-1 md:ml-64 flex flex-col min-h-screen">
        <Navbar title="Video Call" />

        {!inCall ? (
          /* ── Lobby ── */
          <main className="flex-1 flex items-center justify-center px-4 py-8">
            <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 md:p-8 w-full max-w-md shadow-2xl">

              <div className="text-center mb-8">
                <div className="text-6xl mb-4">📹</div>
                <h1 className="text-2xl font-bold text-white">Video Call</h1>
                <p className="text-slate-400 text-sm mt-2">
                  Enter a Room ID to start or join a call
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-slate-300 text-sm mb-1">Room ID</label>
                  <input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && joinRoom()}
                    placeholder="e.g. meeting-room-123"
                    className="w-full bg-slate-700 border border-slate-600 text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-500 placeholder-slate-500"
                  />
                </div>

                <button
                  onClick={joinRoom}
                  disabled={!input.trim()}
                  className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-lg font-medium text-sm transition-colors"
                >
                  Join Room
                </button>

                <button
                  onClick={() => setInput(`room-${user?._id?.slice(-6)}`)}
                  className="w-full py-2.5 border border-slate-600 text-slate-400 hover:text-white hover:border-slate-500 rounded-lg text-sm transition-colors"
                >
                  Generate My Room ID
                </button>
              </div>

              <p className="text-slate-500 text-xs text-center mt-6">
                Share the Room ID with others so they can join your call.
              </p>
            </div>
          </main>
        ) : (
          /* ── In Call ── */
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="flex items-center justify-between px-4 py-2 bg-slate-800 border-b border-slate-700">
              <span className="text-slate-400 text-sm">
                Room: <span className="text-white font-mono">{roomId}</span>
              </span>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                <span className="text-green-400 text-xs">Live</span>
              </div>
            </div>
            <VideoRoom roomId={roomId} onLeave={leaveCall} />
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoCallPage;