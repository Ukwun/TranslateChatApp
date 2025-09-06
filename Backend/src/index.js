// src/index.js
import express from "express";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import { createServer } from "http";
import { Server } from "socket.io";
import dotenv from "dotenv";
import cors from "cors";

import connectDB from "./lib/db.js";

// Routes
import authRoutes from "./routes/auth.route.js";
import messageRoutes from "./routes/message.route.js";
import adminRoutes from "./routes/admin.route.js";
import roomRoutes from "./routes/room.routes.js";

dotenv.config();

const app = express();
const server = createServer(app);
const PORT = process.env.PORT || 5000;

app.set("trust proxy", 1);

/* ----------------------------- MIDDLEWARE ----------------------------- */
app.use(morgan("dev"));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());

const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:3001",
  "http://localhost:5173",
  "http://localhost:5174",
  "https://ukwun.netlify.app",
  "https://www.ukwun.netlify.app",
  "https://ukwunapp.netlify.app",
];

// ✅ Use official cors package
app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin || allowedOrigins.includes(origin)) {
        cb(null, true);
      } else {
        cb(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

// ✅ Ensure OPTIONS requests are always handled
app.options("*", cors());

/* -------------------------- SOCKET.IO SETUP --------------------------- */
const io = new Server(server, {
  cors: {
    origin: (origin, cb) => {
      if (!origin || allowedOrigins.includes(origin)) {
        cb(null, true);
      } else {
        cb(null, false);
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  },
});

// Attach io to req
app.use((req, _res, next) => {
  req.io = io;
  next();
});

io.on("connection", (socket) => {
  console.log("🔌 User connected:", socket.id);

  socket.on("join", (userId) => {
    if (userId) {
      socket.join(userId.toString());
      console.log(`✅ User ${userId} joined their room`);
    }
  });

  socket.on("joinRoom", (roomId) => {
    socket.join(roomId);
    console.log(`User ${socket.id} joined room ${roomId}`);
  });

  socket.on("sendMessage", (message) => {
    if (message.roomId) {
      // Broadcast to all clients in the room except the sender
      socket.to(message.roomId).emit("receiveMessage", message);
    } else if (message.receiverId) {
      // Send to a specific user for private chat
      socket.to(message.receiverId).emit("receiveMessage", message);
    }
  });

  socket.on("typing", (typingData) => {
    if (typingData.roomId) {
      socket.to(typingData.roomId).emit("typing", typingData);
    }
  });

  socket.on("disconnect", () => {
    console.log("❌ User disconnected", socket.id);
  });
});

/* -------------------------------- ROUTES ------------------------------ */
app.get("/", (_req, res) => {
  res.send("✅ Server is running!");
});

app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/rooms", roomRoutes);

/* ----------------------------- 404 HANDLER ---------------------------- */
app.use((req, res, next) => {
  if (req.path.startsWith("/api/")) {
    return res.status(404).json({ message: "API route not found" });
  }
  next();
});

/* ------------------------- ERROR HANDLER ------------------------------- */
app.use((err, req, res, _next) => {
  console.error("❌ Server error:", err);

  // Ensure CORS headers are present on errors
  if (!res.getHeader("Access-Control-Allow-Origin")) {
    const origin = req.headers.origin;
    if (!origin || allowedOrigins.includes(origin)) {
      res.setHeader("Access-Control-Allow-Origin", origin || "*");
      res.setHeader("Vary", "Origin");
      res.setHeader("Access-Control-Allow-Credentials", "true");
      res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
      res.setHeader(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept, Authorization"
      );
    }
  }

  const status = err.status || 500;
  res.status(status).json({ message: err.message || "Internal Server Error" });
});

/* ------------------------------- STARTUP ------------------------------ */
(async () => {
  try {
    await connectDB();
    server.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("❌ Failed to connect to MongoDB:", err);
    process.exit(1);
  }
})();

export default app;
