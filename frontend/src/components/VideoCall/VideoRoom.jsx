// frontend/src/components/VideoCall/VideoRoom.jsx
import { useEffect, useRef, useState, useCallback } from "react";
import VideoControls from "./VideoControls";
import useSocket from "../../hooks/useSocket";
import useAuth from "../../hooks/useAuth"; // ← no curly braces
const ICE_SERVERS = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
  ],
};

const VideoRoom = ({ roomId, onLeave }) => {
  const { user }   = useAuth();
  const { socket } = useSocket();

  const localVideoRef  = useRef(null);
  const localStreamRef = useRef(null);
  const peersRef       = useRef({});  // { socketId: RTCPeerConnection }

  const [remoteStreams, setRemoteStreams] = useState([]); // [{ socketId, stream, name, audio, video }]
  const [audio,  setAudio]  = useState(true);
  const [video,  setVideo]  = useState(true);
  const [joined, setJoined] = useState(false);
  const [error,  setError]  = useState("");

  // ── Get local stream ──────────────────────────────────────────────────────
  const getLocalStream = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      localStreamRef.current = stream;
      if (localVideoRef.current) localVideoRef.current.srcObject = stream;
      return stream;
    } catch (err) {
      setError("Camera/microphone access denied. Please allow permissions.");
      return null;
    }
  }, []);

  // ── Create peer connection ────────────────────────────────────────────────
  const createPeer = useCallback((targetSocketId, stream) => {
    const pc = new RTCPeerConnection(ICE_SERVERS);

    // Add local tracks
    stream.getTracks().forEach((track) => pc.addTrack(track, stream));

    // ICE candidates
    pc.onicecandidate = ({ candidate }) => {
      if (candidate) {
        socket.emit("ice-candidate", { to: targetSocketId, candidate });
      }
    };

    // Remote stream
    pc.ontrack = ({ streams }) => {
      setRemoteStreams((prev) => {
        const exists = prev.find((p) => p.socketId === targetSocketId);
        if (exists) {
          return prev.map((p) =>
            p.socketId === targetSocketId ? { ...p, stream: streams[0] } : p
          );
        }
        return [...prev, { socketId: targetSocketId, stream: streams[0], name: "", audio: true, video: true }];
      });
    };

    peersRef.current[targetSocketId] = pc;
    return pc;
  }, [socket]);

  // ── Join room ─────────────────────────────────────────────────────────────
  const joinRoom = useCallback(async () => {
    const stream = await getLocalStream();
    if (!stream) return;

    socket.emit("join-room", {
      roomId,
      userId: user._id,
      name:   user.name,
    });

    setJoined(true);
  }, [getLocalStream, roomId, socket, user]);

  // ── Socket event handlers ─────────────────────────────────────────────────
  useEffect(() => {
    if (!socket || !joined) return;

    // Existing peers when I join
    socket.on("existing-peers", async (peers) => {
      const stream = localStreamRef.current;
      if (!stream) return;

      for (const peer of peers) {
        const pc    = createPeer(peer.socketId, stream);
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        socket.emit("offer", { to: peer.socketId, offer });

        setRemoteStreams((prev) => [
          ...prev,
          { socketId: peer.socketId, stream: null, name: peer.name, audio: true, video: true },
        ]);
      }
    });

    // New user joined
    socket.on("user-joined", ({ socketId, name }) => {
      setRemoteStreams((prev) => [
        ...prev,
        { socketId, stream: null, name, audio: true, video: true },
      ]);
    });

    // Receive offer
    socket.on("offer", async ({ from, offer }) => {
      const stream = localStreamRef.current;
      if (!stream) return;
      const pc = createPeer(from, stream);
      await pc.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      socket.emit("answer", { to: from, answer });
    });

    // Receive answer
    socket.on("answer", async ({ from, answer }) => {
      const pc = peersRef.current[from];
      if (pc) await pc.setRemoteDescription(new RTCSessionDescription(answer));
    });

    // ICE candidate
    socket.on("ice-candidate", async ({ from, candidate }) => {
      const pc = peersRef.current[from];
      if (pc) await pc.addIceCandidate(new RTCIceCandidate(candidate));
    });

    // Peer media state changed
    socket.on("peer-media-state", ({ socketId, audio: a, video: v }) => {
      setRemoteStreams((prev) =>
        prev.map((p) => (p.socketId === socketId ? { ...p, audio: a, video: v } : p))
      );
    });

    // User left
    socket.on("user-left", ({ socketId }) => {
      if (peersRef.current[socketId]) {
        peersRef.current[socketId].close();
        delete peersRef.current[socketId];
      }
      setRemoteStreams((prev) => prev.filter((p) => p.socketId !== socketId));
    });

    return () => {
      socket.off("existing-peers");
      socket.off("user-joined");
      socket.off("offer");
      socket.off("answer");
      socket.off("ice-candidate");
      socket.off("peer-media-state");
      socket.off("user-left");
    };
  }, [socket, joined, createPeer]);

  // ── Auto join on mount ────────────────────────────────────────────────────
  useEffect(() => {
    if (socket) joinRoom();
    return () => {
      // Cleanup on unmount
      localStreamRef.current?.getTracks().forEach((t) => t.stop());
      Object.values(peersRef.current).forEach((pc) => pc.close());
    };
  }, [socket]);  // eslint-disable-line

  // ── Toggle audio ──────────────────────────────────────────────────────────
  const toggleAudio = () => {
    const stream = localStreamRef.current;
    if (!stream) return;
    stream.getAudioTracks().forEach((t) => (t.enabled = !t.enabled));
    const newAudio = !audio;
    setAudio(newAudio);
    socket.emit("media-state", { roomId, audio: newAudio, video });
  };

  // ── Toggle video ──────────────────────────────────────────────────────────
  const toggleVideo = () => {
    const stream = localStreamRef.current;
    if (!stream) return;
    stream.getVideoTracks().forEach((t) => (t.enabled = !t.enabled));
    const newVideo = !video;
    setVideo(newVideo);
    socket.emit("media-state", { roomId, audio, video: newVideo });
  };

  // ── End call ──────────────────────────────────────────────────────────────
  const endCall = () => {
    socket.emit("leave-room", { roomId });
    localStreamRef.current?.getTracks().forEach((t) => t.stop());
    Object.values(peersRef.current).forEach((pc) => pc.close());
    peersRef.current = {};
    setRemoteStreams([]);
    onLeave();
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col h-full bg-slate-900">

      {/* Error */}
      {error && (
        <div className="bg-red-900/50 border border-red-500 text-red-300 text-sm px-4 py-3 m-4 rounded-lg">
          ⚠️ {error}
        </div>
      )}

      {/* Video Grid */}
      <div className="flex-1 p-4 overflow-y-auto">
        <div className={`grid gap-3 h-full ${
          remoteStreams.length === 0
            ? "grid-cols-1"
            : remoteStreams.length === 1
            ? "grid-cols-1 md:grid-cols-2"
            : "grid-cols-2 md:grid-cols-3"
        }`}>

          {/* Local Video */}
          <div className="relative bg-slate-800 rounded-2xl overflow-hidden border border-slate-700 min-h-[200px]">
            <video
              ref={localVideoRef}
              autoPlay
              muted
              playsInline
              className="w-full h-full object-cover"
            />
            {!video && (
              <div className="absolute inset-0 flex items-center justify-center bg-slate-800">
                <div className="w-20 h-20 rounded-full bg-indigo-600 flex items-center justify-center text-3xl font-bold text-white">
                  {user?.name?.[0]?.toUpperCase()}
                </div>
              </div>
            )}
            <div className="absolute bottom-2 left-3 flex items-center gap-2">
              <span className="text-white text-xs bg-black/50 px-2 py-0.5 rounded-full">
                You {!audio && "🔇"} {!video && "🚫"}
              </span>
            </div>
          </div>

          {/* Remote Videos */}
          {remoteStreams.map((peer) => (
            <RemoteVideo key={peer.socketId} peer={peer} />
          ))}
        </div>
      </div>

      {/* Controls */}
      <div className="flex justify-center pb-6 px-4">
        <VideoControls
          audio={audio}
          video={video}
          onToggleAudio={toggleAudio}
          onToggleVideo={toggleVideo}
          onEndCall={endCall}
        />
      </div>
    </div>
  );
};

// ── Remote Video tile ─────────────────────────────────────────────────────────
const RemoteVideo = ({ peer }) => {
  const videoRef = useRef(null);

  useEffect(() => {
    if (videoRef.current && peer.stream) {
      videoRef.current.srcObject = peer.stream;
    }
  }, [peer.stream]);

  return (
    <div className="relative bg-slate-800 rounded-2xl overflow-hidden border border-slate-700 min-h-[200px]">
      {peer.stream && peer.video !== false ? (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-800">
          <div className="w-20 h-20 rounded-full bg-slate-600 flex items-center justify-center text-3xl font-bold text-white">
            {peer.name?.[0]?.toUpperCase() || "?"}
          </div>
        </div>
      )}
      <div className="absolute bottom-2 left-3">
        <span className="text-white text-xs bg-black/50 px-2 py-0.5 rounded-full">
          {peer.name || "Peer"} {!peer.audio && "🔇"} {!peer.video && "🚫"}
        </span>
      </div>
    </div>
  );
};

export default VideoRoom;