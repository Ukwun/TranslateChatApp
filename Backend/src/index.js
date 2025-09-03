// server/index.js (or server.js)
import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import morgan from "morgan";
import { createServer } from "http";
import { Server } from "socket.io";

import dotenv from "dotenv";
dotenv.config();

import connectDB from "./lib/db.js";
import authRoutes from "./routes/auth.routes.js";
import messageRoutes from "./routes/message.routes.js";
import adminRoutes from "./routes/admin.route.js";

const app = express();
const server = createServer(app);
const PORT = process.env.PORT || 5000;

/* ----------------------------- MIDDLEWARE ----------------------------- */

// Log requests (optional but super helpful)
app.use(morgan("dev"));

// Body parsers
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Cookies
app.use(cookieParser());

// CORS (allow credentials + your local front-end hosts)
const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:3001",
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:5000",
  "https://ukwunapp.netlify.app/",
];

const corsOptions = {
  origin: function (origin, cb) {
    // Always allow Netlify frontend and localhost
    if (!origin || allowedOrigins.includes(origin) || origin?.includes('netlify.app')) return cb(null, true);
    return cb(new Error(`CORS blocked for origin: ${origin}`));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

// Handle preflight OPTIONS requests for all routes
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", req.headers.origin || allowedOrigins[0]);
  res.header("Access-Control-Allow-Credentials", "true");
  res.header("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type,Authorization");
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});
app.use(cors(corsOptions));

/* -------------------------- SOCKET.IO SETUP ------------------------- */

import jwt from "jsonwebtoken";
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
  },
});

// Socket.IO JWT auth middleware
io.use((socket, next) => {
  let token = socket.handshake.auth?.token;
  if (!token && socket.handshake.headers?.cookie) {
    // Try to get token from cookies
    const match = socket.handshake.headers.cookie.match(/jwt=([^;]+)/);
    if (match) token = match[1];
  }
  if (!token) return next(new Error("Authentication error: No token provided"));
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.userId = decoded.userId;
    // Auto-join user room
    socket.join(socket.userId);
    next();
  } catch (err) {
    next(new Error("Authentication error: Invalid token"));
  }
});

// Attach io to req so it can be accessed in controllers
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Socket.IO events
io.on("connection", (socket) => {
  console.log("🔌 User connected:", socket.id, "userId:", socket.userId);

  // Typing indicator
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

// Debug endpoint for sockets
app.get("/debug/sockets", (req, res) => {
  try {
    const sockets = Array.from(io.sockets.sockets.values()).map(s => ({
      id: s.id,
      userId: s.userId,
      rooms: Array.from(s.rooms),
    }));
    res.json({ count: sockets.length, sockets });
  } catch (err) {
    res.status(500).json({ message: "error", err });
  }
});

/* ----------------------------- 404 HANDLER ---------------------------- */
app.use((req, res, next) => {
  if (req.path.startsWith("/api/")) {
    return res.status(404).json({ message: "API route not found" });
  }
  next();
});

/* ------------------------- CENTRAL ERROR HANDLER ---------------------- */
app.use((err, _req, res, _next) => {
  // Ensure we always see the real error in the server logs
  console.error("❌ Server error:", err);
  const status = err.status || 500;
  const message =
    err.message || "Internal Server Error. Please check server logs.";
  res.status(status).json({ message });
});

/* ------------------------------- STARTUP ------------------------------ */
(async () => {
  try {
    await connectDB(); // connect to Mongo BEFORE starting server
    server.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("❌ Failed to connect to MongoDB:", err);
    process.exit(1);
  }
})();

export default app;
