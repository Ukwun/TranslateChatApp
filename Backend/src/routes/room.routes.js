// ✅ Delete room by ID
router.delete("/:roomId", async (req, res) => {
  try {
    const room = await ChatRoom.findByIdAndDelete(req.params.roomId);
    if (!room) return res.status(404).json({ error: "Room not found" });
    res.json({ success: true });
  } catch (err) {
    console.error("Error deleting room:", err);
    res.status(500).json({ error: "Failed to delete room" });
  }
});
import express from "express";
import ChatRoom from "../models/chatroom.model.js";

const router = express.Router();

// ✅ Create room
router.post("/", async (req, res) => {
  try {
    const { name, description } = req.body;
    const room = await ChatRoom.create({ name, description });
    res.status(201).json(room);
  } catch (err) {
    console.error("Error creating room:", err);
    res.status(500).json({ error: "Failed to create room" });
  }
});

// ✅ Get all rooms
router.get("/", async (req, res) => {
  try {
    const rooms = await ChatRoom.find();
    res.json(rooms);
  } catch (err) {
    console.error("Error fetching rooms:", err);
    res.status(500).json({ error: "Failed to fetch rooms" });
  }
});

// ✅ Get single room by ID
router.get("/:roomId", async (req, res) => {
  try {
    const room = await ChatRoom.findById(req.params.roomId);
    if (!room) return res.status(404).json({ error: "Room not found" });
    res.json(room);
  } catch (err) {
    console.error("Error fetching room:", err);
    res.status(500).json({ error: "Failed to fetch room" });
  }
});

export default router;
