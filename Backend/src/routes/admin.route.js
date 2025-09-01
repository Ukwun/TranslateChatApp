import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import User from "../models/user.model.js";
import ChatRoom from "../models/chatroom.model.js";

const router = express.Router();

// Get all members
router.get("/members", protectRoute, async (req, res) => {
  const members = await User.find({ role: "member" });
  res.json(members);
});

// Disable member
router.post("/disable/:id", protectRoute, async (req, res) => {
  await User.findByIdAndUpdate(req.params.id, { disabled: true });
  res.json({ success: true });
});

// Delete member
router.delete("/delete/:id", protectRoute, async (req, res) => {
  await User.findByIdAndDelete(req.params.id);
  res.json({ success: true });
});

// Change nickname
router.put("/nickname/:id", protectRoute, async (req, res) => {
  await User.findByIdAndUpdate(req.params.id, { nickname: req.body.nickname });
  res.json({ success: true });
});

// Create chat room and invite members
router.post("/create-room", protectRoute, async (req, res) => {
  const { name, members } = req.body;
  const room = await ChatRoom.create({ name, members: [...members, req.userId] });
  res.json({ success: true, room });
});

export default router;
