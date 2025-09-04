import express from "express";
import ChatRoom from "../models/chatroom.model.js";

const router = express.Router();

// GET /api/rooms
router.get("/", async (req, res) => {
  try {
    const rooms = await ChatRoom.find();
    res.json(rooms);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch rooms" });
  }
});

// POST /api/rooms
router.post("/", async (req, res) => {
  try {
    const { name, description } = req.body;
    const room = new ChatRoom({ name, description });
    await room.save();
    res.status(201).json(room);
  } catch (err) {
    res.status(500).json({ error: "Failed to create room" });
  }
});

export default router;
