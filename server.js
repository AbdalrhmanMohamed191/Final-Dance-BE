const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const path = require("path");
const http = require("http");
const { Server } = require("socket.io");

// Internal imports
const { connectDB } = require("./config/dbConfig");
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userProfile");
const postsRoutes = require("./routes/postsRoutes");
const commentsRoutes = require("./routes/commentsRoutes");
const messageRoutes = require("./routes/messageRoutes");
const storyRoutes = require("./routes/storiesRoutes");

// File upload
const upload = require("./uploads/uploads");

dotenv.config();

// APP
const app = express();
const server = http.createServer(app);

// SOCKET.IO
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

// Make io accessible in routes
app.set("io", io);

// MIDDLEWARES
app.use(express.json());
app.use(cors());

// Static folders
app.use("/public", express.static(path.join(__dirname, "public")));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ROUTES
app.get("/", (req, res) => {
  res.send("Server is running");
});

// Upload message files
app.post("/api/v1/messages/upload", upload.single("file"), (req, res) => {
  res.json({
    url: `/uploads/${req.file.filename}`,
  });
});

// app.post("/upload", upload.single("file"), (req, res) => {
//     res.json({ file: req.file });
// });

// API ROUTES
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/user", userRoutes);
app.use("/api/v1/posts", postsRoutes);
app.use("/api/v1/comments", commentsRoutes);
app.use("/api/v1/messages", messageRoutes);
app.use("/api/v1/stories", storyRoutes);

// ================= SOCKET LOGIC =================

const onlineUsers = new Map(); // userId => socketId

io.on("connection", (socket) => {
  console.log("🟢 Client connected:", socket.id);

  // Join chat room + mark online
  socket.on("joinRoom", ({ roomId, userId }) => {
    socket.join(roomId);

    onlineUsers.set(userId, socket.id);
    console.log(`✅ User ${userId} joined ${roomId}`);

    io.emit("updateOnlineUsers", Array.from(onlineUsers.keys()));
  });

  // Send message (REAL TIME)
  socket.on("sendMessage", (data) => {
    const {
      sender,
      receiver,
      text,
      fileUrl,
      roomId,
    } = data;

    const message = {
      sender,
      receiver,
      text,
      fileUrl,
      createdAt: new Date(),
      delivered: true,
      seen: false,
    };

    // 🔥 Send to both users instantly
    io.to(roomId).emit("newMessage", message);
  });

  // Typing indicator
  socket.on("typing", ({ roomId, userId }) => {
    socket.to(roomId).emit("typing", { userId });
  });

  // Disconnect
  socket.on("disconnect", () => {
    console.log("🔴 Client disconnected:", socket.id);

    for (let [userId, sId] of onlineUsers.entries()) {
      if (sId === socket.id) {
        onlineUsers.delete(userId);
        break;
      }
    }

    io.emit("updateOnlineUsers", Array.from(onlineUsers.keys()));
  });
});

// CONNECT DB
connectDB();

// SERVER LISTENER
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});