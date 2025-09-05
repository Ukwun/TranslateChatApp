// src/routes/room.routes.js
import express from "express";
import Room from "../models/room.model.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

/**
 * @route POST /api/rooms
 * @desc Create a new room
 */
router.post("/", protectRoute, async (req, res) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Room name is required" });
    }

    const newRoom = new Room({
      name,
      createdBy: req.user._id, // ✅ fix here
    });

    await newRoom.save();

    res.status(201).json(newRoom);
  } catch (err) {
    console.error("Error creating room:", err);
    res.status(500).json({ message: err.message || "Failed to create room" });
  }
});

/**
 * @route GET /api/rooms
 * @desc Get all rooms
 */
router.get("/", protectRoute, async (_req, res) => {
  try {
    const rooms = await Room.find().populate("createdBy", "username email");
    res.json(rooms);
  } catch (err) {
    console.error("Error fetching rooms:", err);
    res.status(500).json({ message: "Failed to fetch rooms" });
  }
});

/**
 * @route GET /api/rooms/:id
 * @desc Get room by ID
 */
router.get("/:id", protectRoute, async (req, res) => {
  try {
    const room = await Room.findById(req.params.id).populate("createdBy", "username email");
    if (!room) return res.status(404).json({ message: "Room not found" });
    res.json(room);
  } catch (err) {
    console.error("Error fetching room:", err);
    res.status(500).json({ message: "Failed to fetch room" });
  }
});

/**
 * @route DELETE /api/rooms/:id
 * @desc Delete a room
 */
router.delete("/:id", protectRoute, async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room) return res.status(404).json({ message: "Room not found" });

    // Optional: only creator can delete
    if (room.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to delete this room" });
    }

    await room.deleteOne();
    res.json({ message: "Room deleted successfully" });
  } catch (err) {
    console.error("Error deleting room:", err);
    res.status(500).json({ message: "Failed to delete room" });
  }
});

export default router;
