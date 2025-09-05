import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import {
  getUsersForSidebar,
  getConversationMessages,
  sendTextMessage,
  sendImageMessage,
} from "../controllers/message.controller.js";

const router = express.Router();

// ✅ Get all users for sidebar (online users, contacts, etc.)
router.get("/users", protectRoute, getUsersForSidebar);

// ✅ Get conversation messages (supports user-to-user or roomId query)
router.get(
  "/conversation/:senderId/:receiverId",
  protectRoute,
  getConversationMessages
);

// ✅ Send a text message
router.post("/send-text", protectRoute, sendTextMessage);

// ✅ Send an image message
router.post("/send-image", protectRoute, sendImageMessage);

export default router;
