import express from "express";
import ChatRoom from "../models/chatroom.model.js";
import User from "../models/user.model.js";
import { protectRoute } from "../middleware/auth.middleware.js";

// Get all rooms created by admin
const router = express.Router();
router.get("/rooms", protectRoute, async (req, res) => {
  const { adminId } = req.query;
  try {
    const rooms = await ChatRoom.find({ createdBy: adminId });
    res.json(rooms);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create a chat room (admin only)
router.post("/create", protectRoute, async (req, res) => {
  const { name, memberIds } = req.body;
  const adminId = req.user._id;
  try {
    const room = await ChatRoom.create({
      name,
      createdBy: adminId,
      members: [adminId, ...memberIds],
    });
    res.status(201).json(room);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get all members in a room
router.get("/:roomId/members", protectRoute, async (req, res) => {
  try {
    const room = await ChatRoom.findById(req.params.roomId).populate("members");
    if (!room) return res.status(404).json({ message: "Room not found" });
    res.json(room.members);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Admin: change member nickname
router.put("/:roomId/nickname", protectRoute, async (req, res) => {
  const { memberId, nickname } = req.body;
  try {
    const user = await User.findByIdAndUpdate(memberId, { fullName: nickname }, { new: true });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Admin: disable or delete member
router.delete("/:roomId/member/:memberId", protectRoute, async (req, res) => {
  try {
    const room = await ChatRoom.findByIdAndUpdate(
      req.params.roomId,
      { $pull: { members: req.params.memberId } },
      { new: true }
    );
    res.json(room);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
