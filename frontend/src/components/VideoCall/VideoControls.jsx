// frontend/src/components/VideoCall/VideoControls.jsx

const VideoControls = ({ audio, video, onToggleAudio, onToggleVideo, onEndCall }) => {
  return (
    <div className="flex items-center justify-center gap-4 py-4 px-6 bg-slate-800/90 backdrop-blur rounded-2xl border border-slate-700 shadow-xl">

      {/* Mic */}
      <button
        onClick={onToggleAudio}
        title={audio ? "Mute" : "Unmute"}
        className={`w-12 h-12 rounded-full flex items-center justify-center text-xl transition-all duration-200 ${
          audio
            ? "bg-slate-700 hover:bg-slate-600 text-white"
            : "bg-red-600 hover:bg-red-500 text-white"
        }`}
      >
        {audio ? "🎙️" : "🔇"}
      </button>

      {/* Camera */}
      <button
        onClick={onToggleVideo}
        title={video ? "Turn off camera" : "Turn on camera"}
        className={`w-12 h-12 rounded-full flex items-center justify-center text-xl transition-all duration-200 ${
          video
            ? "bg-slate-700 hover:bg-slate-600 text-white"
            : "bg-red-600 hover:bg-red-500 text-white"
        }`}
      >
        {video ? "📹" : "🚫"}
      </button>

      {/* End Call */}
      <button
        onClick={onEndCall}
        title="End call"
        className="w-14 h-14 rounded-full bg-red-600 hover:bg-red-500 text-white text-2xl flex items-center justify-center transition-all duration-200 shadow-lg"
      >
        📵
      </button>
    </div>
  );
};

export default VideoControls;