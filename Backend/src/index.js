// server/index.js (or server.js)
import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import morgan from "morgan";
import { createServer } from "http";
import { Server } from "socket.io";

import connectDB from "./lib/db.js";
import authRoutes from "./routes/auth.route.js";
import messageRoutes from "./routes/message.route.js";

dotenv.config();

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
  "https://ukwunapp.netlify.app/",
];

const corsOptions = {
  origin: function (origin, cb) {
    // Allow all origins for socket.io polling transport
    if (!origin || allowedOrigins.includes(origin) || origin?.includes('netlify.app')) return cb(null, true);
    return cb(new Error(`CORS blocked for origin: ${origin}`));
  },
  credentials: true,
};

app.use(cors(corsOptions));

/* -------------------------- SOCKET.IO SETUP ------------------------- */

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
  },
});

// Attach io to req so it can be accessed in controllers
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Socket.IO events
io.on("connection", (socket) => {
  console.log("🔌 User connected:", socket.id);

  socket.on("join", (userId) => {
    socket.join(userId); // join room with userId
    console.log(`✅ User ${userId} joined their room`);
  });

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
