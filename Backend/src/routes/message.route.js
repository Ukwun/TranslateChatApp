import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import {
  getUsersForSidebar,
  getMessages,
  sendMessage,
  getConversationMessages,
  getRoomMessages,
} from "../controllers/message.controller.js";
import upload from "../middleware/multer.middleware.js";

const router = express.Router();

// ✅ Get all users except the logged-in one
router.get("/users", protectRoute, getUsersForSidebar);

// ✅ Get all messages for a room
router.get("/room/:roomId", protectRoute, getRoomMessages);

// ✅ Get messages between logged-in user and another user
router.get("/:id", protectRoute, getMessages);

// ✅ Send a message (private or room, with optional image)
router.post("/send", protectRoute, upload.single("image"), sendMessage);

// ✅ Get all messages from a conversation by conversationId
router.get("/conversation/:conversationId", protectRoute, getConversationMessages);

export default router;
