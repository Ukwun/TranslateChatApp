import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { 
  getUsersForSidebar, 
  getMessages, 
  sendMessage, 
  getConversationMessages 
} from "../controllers/message.controller.js";

const router = express.Router();

// ✅ Get all users except the logged-in one
router.get("/users", protectRoute, getUsersForSidebar);

// ✅ Get messages between logged-in user and another user
router.get("/:id", protectRoute, getMessages);

// ✅ Send a message to another user
router.post("/send/:id", protectRoute, sendMessage);

// ✅ Get all messages from a conversation by conversationId
router.get("/conversation/:conversationId", protectRoute, getConversationMessages);

export default router;
