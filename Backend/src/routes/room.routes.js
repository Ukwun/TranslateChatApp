// src/routes/room.routes.js
import express from "express";
import ChatRoom from "../models/chatroom.model.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

/**
 * @route POST /api/rooms
 * @desc Create a new room
 */
router.post("/", protectRoute, async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Room name is required" });
    }

    const newRoom = new ChatRoom({
      name,
      description,
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
    const rooms = await ChatRoom.find().populate("createdBy", "fullName email");
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
    const room = await ChatRoom.findById(req.params.id).populate("createdBy", "fullName email");
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
    const room = await ChatRoom.findById(req.params.id);
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

/**
 * @route POST /api/rooms/:id/invite
 * @desc Invite a user to a room
 * @note Assumes your chatroom.model.js has a `members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]` field.
 */
router.post("/:id/invite", protectRoute, async (req, res) => {
  try {
    const { userId } = req.body;
    const room = await ChatRoom.findById(req.params.id);

    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }
    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    if (room.members.includes(userId)) {
      return res.status(400).json({ message: "User is already a member of this room" });
    }

    room.members.push(userId);
    await room.save();

    const updatedRoom = await ChatRoom.findById(req.params.id).populate("members", "fullName email").populate("createdBy", "fullName");

    // Emit a notification to the invited user
    req.io.to(userId).emit("room-invite", {
        room: { _id: updatedRoom._id, name: updatedRoom.name },
        inviter: { fullName: req.user.fullName }
    });

    res.json(updatedRoom);
  } catch (err) {
    console.error("Error inviting user to room:", err);
    res.status(500).json({ message: "Failed to invite user" });
  }
});

export default router;
