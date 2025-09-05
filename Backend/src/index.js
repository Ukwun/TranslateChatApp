// src/index.js
import express from "express";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import { createServer } from "http";
import { Server } from "socket.io";
import dotenv from "dotenv";

import connectDB from "./lib/db.js";

// Routes (each must export `default router`)
import authRoutes from "./routes/auth.route.js";
import messageRoutes from "./routes/message.route.js";
import adminRoutes from "./routes/admin.route.js";
import roomRoutes from "./routes/room.routes.js";

dotenv.config();

const app = express();
const server = createServer(app);
const PORT = process.env.PORT || 5000;

// If you use secure cookies behind a proxy (Render), trust proxy
app.set("trust proxy", 1);

/* ----------------------------- MIDDLEWARE ----------------------------- */

app.use(morgan("dev"));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());

// Whitelist of allowed origins
const allowedOrigins = new Set([
  "http://localhost:3000",
  "http://localhost:3001",
  "http://localhost:5173",
  "http://localhost:5174",
  "https://ukwun.netlify.app",
  "https://www.ukwun.netlify.app",
  "https://ukwunapp.netlify.app",
]);

/**
 * Lightweight CORS layer that ALWAYS sets headers (even on errors),
 * and short-circuits OPTIONS preflight with 204.
 */
app.use((req, res, next) => {
  const origin = req.headers.origin;
  const isAllowed = !origin || allowedOrigins.has(origin);

  if (isAllowed) {
    res.setHeader("Access-Control-Allow-Origin", origin || "http://localhost:5173");
    res.setHeader("Vary", "Origin");
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
    res.setHeader(
      "Access-Control-Allow-Headers",
      "Origin, X-Requested-With, Content-Type, Accept, Authorization"
    );
  }

  if (req.method === "OPTIONS") {
    // Important: end preflight here so no other middleware runs
    return res.sendStatus(204);
  }

  return next();
});

/* -------------------------- SOCKET.IO SETUP --------------------------- */

const io = new Server(server, {
  cors: {
    origin: (origin, cb) => {
      // Allow same whitelist for websockets
      if (!origin || allowedOrigins.has(origin)) return cb(null, true);
      // Still allow from localhost/no origin (e.g., server-to-server)
      return cb(null, true);
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  },
});

// Attach io to req for controllers
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

  socket.on("typing", (receiverId) => {
    if (receiverId) {
      socket.to(receiverId.toString()).emit("typing", socket.id);
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

/* ------------------------- CENTRAL ERROR HANDLER ---------------------- */
// Ensure CORS headers are still present on error responses
app.use((err, req, res, _next) => {
  const origin = req.headers.origin;
  if (!res.getHeader("Access-Control-Allow-Origin")) {
    if (!origin || allowedOrigins.has(origin)) {
      res.setHeader("Access-Control-Allow-Origin", origin || "http://localhost:5173");
      res.setHeader("Vary", "Origin");
      res.setHeader("Access-Control-Allow-Credentials", "true");
      res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
      res.setHeader(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept, Authorization"
      );
    }
  }

  console.error("❌ Server error:", err);
  const status = err.status || 500;
  const message = err.message || "Internal Server Error";
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
