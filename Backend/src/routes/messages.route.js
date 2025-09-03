import express from "express";
import { sendTextMessage, sendMessage, getMessages } from "../controllers/message.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

// Send a text message (with translation)
router.post("/text", protectRoute, sendTextMessage);
// Send a message (with image, translation)
router.post("/:id", protectRoute, sendMessage);
// Get messages in a conversation
router.get("/:id", protectRoute, getMessages);

export default router;
