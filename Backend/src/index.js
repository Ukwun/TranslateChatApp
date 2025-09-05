// src/index.js
import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import morgan from "morgan";
import { createServer } from "http";
import { Server } from "socket.io";
import dotenv from "dotenv";

import connectDB from "./lib/db.js";

// ✅ Ensure these route files each use `export default router`
import authRoutes from "./routes/auth.route.js";
import messageRoutes from "./routes/message.route.js";
import adminRoutes from "./routes/admin.route.js";
import roomRoutes from "./routes/room.routes.js";

dotenv.config();

const app = express();
const server = createServer(app);
const PORT = process.env.PORT || 5000;

/* ----------------------------- MIDDLEWARE ----------------------------- */

// Logs HTTP requests
app.use(morgan("dev"));

// Body parsers
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Cookie parsing
app.use(cookieParser());

// Allowed CORS origins
const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:3001",
  "http://localhost:5173",
  "http://localhost:5174",
  "https://ukwun.netlify.app",
  "https://www.ukwun.netlify.app",
  "https://ukwunapp.netlify.app",
  "https://translatechatapp.onrender.com",
];

// ✅ Apply CORS before routes
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, origin);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: [
      "Origin",
      "X-Requested-With",
      "Content-Type",
      "Accept",
      "Authorization",
    ],
  })
);

/* -------------------------- SOCKET.IO SETUP ------------------------- */

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
  },
});

// Attach io instance to req object
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Socket.IO events
io.on("connection", (socket) => {
  console.log("🔌 User connected:", socket.id);

  socket.on("join", (userId) => {
    socket.join(userId);
    console.log(`✅ User ${userId} joined their room`);
  });

  socket.on("typing", (receiverId) => {
    socket.to(receiverId).emit("typing", socket.userId || socket.id);
  });

  socket.on("disconnect", () => {
    console.log("❌ User disconnected", socket.id);
  });
});

/* -------------------------------- ROUTES ------------------------------ */

// Health check
app.get("/", (_req, res) => {
  res.send("✅ Server is running!");
});

// API routes
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

/* ------------------------- CENTRAL ERROR HANDLER ---------------------- */
app.use((err, _req, res, _next) => {
  console.error("❌ Server error:", err);
  const status = err.status || 500;
  const message =
    err.message || "Internal Server Error. Please check server logs.";
  res.status(status).json({ message });
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
