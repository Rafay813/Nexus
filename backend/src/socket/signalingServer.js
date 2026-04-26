// backend/src/socket/signalingServer.js
const { Server } = require("socket.io");

const initSignalingServer = (httpServer) => {
  const io = new Server(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL || "http://localhost:3000",
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  // Track users in rooms: { roomId: { socketId: { userId, name } } }
  const rooms = {};

  io.on("connection", (socket) => {
    console.log(`🔌 Socket connected: ${socket.id}`);

    // ── Join a room ───────────────────────────────────────────────────────
    socket.on("join-room", ({ roomId, userId, name }) => {
      socket.join(roomId);

      if (!rooms[roomId]) rooms[roomId] = {};
      rooms[roomId][socket.id] = { userId, name };

      // Tell everyone else in the room a new user joined
      socket.to(roomId).emit("user-joined", {
        socketId: socket.id,
        userId,
        name,
      });

      // Send the new user a list of existing peers
      const existingPeers = Object.entries(rooms[roomId])
        .filter(([id]) => id !== socket.id)
        .map(([id, data]) => ({ socketId: id, ...data }));

      socket.emit("existing-peers", existingPeers);

      console.log(`👤 ${name} joined room: ${roomId}`);
    });

    // ── WebRTC Offer ──────────────────────────────────────────────────────
    socket.on("offer", ({ to, offer }) => {
      io.to(to).emit("offer", { from: socket.id, offer });
    });

    // ── WebRTC Answer ─────────────────────────────────────────────────────
    socket.on("answer", ({ to, answer }) => {
      io.to(to).emit("answer", { from: socket.id, answer });
    });

    // ── ICE Candidate ─────────────────────────────────────────────────────
    socket.on("ice-candidate", ({ to, candidate }) => {
      io.to(to).emit("ice-candidate", { from: socket.id, candidate });
    });

    // ── Media state (mute/video toggle) ───────────────────────────────────
    socket.on("media-state", ({ roomId, audio, video }) => {
      socket.to(roomId).emit("peer-media-state", {
        socketId: socket.id,
        audio,
        video,
      });
    });

    // ── Leave room ────────────────────────────────────────────────────────
    socket.on("leave-room", ({ roomId }) => {
      handleLeave(socket, roomId, io, rooms);
    });

    // ── Disconnect ────────────────────────────────────────────────────────
    socket.on("disconnect", () => {
      // Find and clean up any room this socket was in
      for (const roomId in rooms) {
        if (rooms[roomId][socket.id]) {
          handleLeave(socket, roomId, io, rooms);
          break;
        }
      }
      console.log(`❌ Socket disconnected: ${socket.id}`);
    });
  });

  return io;
};

const handleLeave = (socket, roomId, io, rooms) => {
  if (rooms[roomId]) {
    delete rooms[roomId][socket.id];
    if (Object.keys(rooms[roomId]).length === 0) {
      delete rooms[roomId];
    }
  }
  socket.to(roomId).emit("user-left", { socketId: socket.id });
  socket.leave(roomId);
  console.log(`🚪 Socket ${socket.id} left room: ${roomId}`);
};

module.exports = initSignalingServer;