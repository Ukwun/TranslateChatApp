import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { getMessages, getUsersForSidebar, sendMessage, getConversationMessages, sendTextMessage, sendImageMessage } from "../controllers/message.controller.js";

const router = express.Router();


router.get("/users",protectRoute, getUsersForSidebar)
router.get("/:id",protectRoute,getMessages)
router.post("/send/:id", protectRoute, sendMessage)
router.post("/send-text", protectRoute, sendTextMessage);
router.post("/send-image", protectRoute, sendImageMessage);

// New route to get all messages between two users
router.get("/conversation/:userId/:chatUserId", protectRoute, getConversationMessages);

export default router;
