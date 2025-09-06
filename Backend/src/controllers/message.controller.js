import User from "../models/user.model.js";
import Conversation from "../models/conversation.model.js";
import Message from "../models/message.model.js";
import ChatRoom from "../models/chatroom.model.js";
import cloudinary from "../lib/cloudinary.js";
import { translateText } from "../lib/translate.js";

// ✅ Sidebar Users (excluding logged-in user)
export const getUsersForSidebar = async (req, res) => {
  try {
    const loggedInUserId = req.user._id;
    const filteredUsers = await User.find({ _id: { $ne: loggedInUserId } }).select("-password");
    res.status(200).json(filteredUsers);
  } catch (error) {
    console.error("❌ Error in getUsersForSidebar:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// ✅ Get messages between logged-in user and another user
export const getMessages = async (req, res) => {
  try {
    const senderId = req.user._id;
    const receiverId = req.params.id;
    const { roomId } = req.query;

    if (roomId) {
      const room = await ChatRoom.findById(roomId);
      if (!room || !room.members.includes(senderId) || !room.members.includes(receiverId)) {
        return res.status(403).json({ message: "Access denied: Not a member of this room." });
      }
    }

    const conversation = await Conversation.findOne({
      participants: { $all: [senderId, receiverId] },
    }).populate("messages");

    if (!conversation) return res.status(200).json([]);

    res.status(200).json(conversation.messages);
  } catch (error) {
    console.error("❌ Error in getMessages:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ Get messages by conversationId (Option 2)
export const getConversationMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;

    const conversation = await Conversation.findById(conversationId).populate("messages");
    if (!conversation) {
      return res.status(404).json({ message: "Conversation not found" });
    }

    res.status(200).json(conversation.messages);
  } catch (error) {
    console.error("❌ Error in getConversationMessages:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ Get messages for a room
export const getRoomMessages = async (req, res) => {
  try {
    const { roomId } = req.params;
    const messages = await Message.find({ roomId }).populate(
      "senderId",
      "fullName profilePic"
    );
    res.status(200).json(messages);
  } catch (error) {
    console.error("❌ Error in getRoomMessages:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ Send a message (private or room)
export const sendMessage = async (req, res) => {
  try {
    const senderId = req.user._id;
    const { text, roomId, receiverId } = req.body;
    let imageUrl = "";

    if (req.file) {
      const uploadResponse = await cloudinary.uploader.upload(req.file.path);
      imageUrl = uploadResponse.secure_url;
    }

    if (!text && !imageUrl) {
      return res
        .status(400)
        .json({ message: "Message content cannot be empty" });
    }

    let newMessage;

    if (roomId) {
      const room = await ChatRoom.findById(roomId);
      if (!room) return res.status(404).json({ message: "Room not found" });

      newMessage = new Message({
        senderId,
        roomId,
        text: text || "",
        image: imageUrl || "",
      });

      room.messages.push(newMessage._id);
      await Promise.all([newMessage.save(), room.save()]);

      await newMessage.populate("senderId", "fullName profilePic");
      req.io.to(roomId).emit("receiveMessage", newMessage);
    } else if (receiverId) {
      let conversation = await Conversation.findOne({
        participants: { $all: [senderId, receiverId] },
      });
      if (!conversation) {
        conversation = await Conversation.create({
          participants: [senderId, receiverId],
        });
      }
      newMessage = new Message({
        senderId,
        receiverId,
        text: text || "",
        image: imageUrl || "",
      });
      conversation.messages.push(newMessage._id);
      await Promise.all([newMessage.save(), conversation.save()]);
      await newMessage.populate("senderId", "fullName profilePic");
      req.io.to(receiverId.toString()).emit("receiveMessage", newMessage);
      req.io.to(senderId.toString()).emit("receiveMessage", newMessage);
    } else {
      return res
        .status(400)
        .json({ message: "Invalid request: requires roomId or receiverId" });
    }

    res.status(201).json(newMessage);
  } catch (error) {
    console.error("❌ Error in sendMessage:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};
