import User from "../models/user.model.js";
import Conversation from "../models/conversation.model.js";
import Message from "../models/message.model.js";
import ChatRoom from "../models/chatroom.model.js";
import cloudinary from "../lib/cloudinary.js";
import { translateText } from "../lib/translate.js";

// Sidebar users (excluding logged-in user)
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

// Get messages (supports both direct chat & room chat)
export const getMessages = async (req, res) => {
  try {
    const senderId = req.user._id;
    const receiverId = req.params.id;
    const { roomId } = req.query;

    if (roomId) {
      // Fetch messages from a room
      const room = await ChatRoom.findById(roomId).populate("messages");
      if (!room) {
        return res.status(404).json({ message: "Room not found" });
      }
      if (!room.members.includes(senderId)) {
        return res.status(403).json({ message: "Access denied: Not a member of this room." });
      }
      return res.status(200).json(room.messages);
    }

    // Fetch direct conversation messages
    const conversation = await Conversation.findOne({
      participants: { $all: [senderId, receiverId] },
    }).populate("messages");

    if (!conversation) return res.status(200).json([]);
    res.status(200).json(conversation.messages);
  } catch (error) {
    console.error("❌ Error in getMessages controller:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

// Send message (to user or to room)
export const sendMessage = async (req, res) => {
  try {
    const senderId = req.user._id;
    const receiverId = req.params.id; // Used in direct chat
    const { text, image, roomId } = req.body;

    let imageUrl;
    if (image) {
      const uploadResponse = await cloudinary.uploader.upload(image);
      imageUrl = uploadResponse.secure_url;
    }

    let translatedText = text || "";
    let originalText = text || "";

    if (receiverId) {
      // Translate for direct messages
      const receiver = await User.findById(receiverId);
      const langMap = {
        en: "English",
        ko: "Korean",
        fr: "French",
        es: "Spanish",
        de: "German",
        zh: "Chinese",
        ja: "Japanese",
        ru: "Russian",
        it: "Italian",
      };
      const targetLangCode = receiver?.language || "en";
      const targetLangName = langMap[targetLangCode] || "English";

      const sender = await User.findById(senderId);
      const senderLang = sender?.language || "en";

      if (text && targetLangCode !== senderLang) {
        try {
          translatedText = await translateText(text, targetLangName, process.env.OPENAI_API_KEY);
        } catch (err) {
          console.error("❌ Translation error:", err.message);
        }
      }
    }

    let newMessage;

    if (roomId) {
      // Save message in a room
      const room = await ChatRoom.findById(roomId);
      if (!room) return res.status(404).json({ message: "Room not found" });
      if (!room.members.includes(senderId)) {
        return res.status(403).json({ message: "Access denied: Not a member of this room." });
      }

      newMessage = await Message.create({
        senderId,
        text: translatedText,
        image: imageUrl || "",
        originalText,
        translatedText,
        roomId,
      });

      room.messages.push(newMessage._id);
      await room.save();
      req.io.to(roomId.toString()).emit("newMessage", newMessage);
    } else {
      // Save direct chat message
      let conversation = await Conversation.findOne({
        participants: { $all: [senderId, receiverId] },
      });

      if (!conversation) {
        conversation = await Conversation.create({
          participants: [senderId, receiverId],
          messages: [],
        });
      }

      newMessage = await Message.create({
        senderId,
        receiverId,
        text: translatedText,
        image: imageUrl || "",
        originalText,
        translatedText,
      });

      conversation.messages.push(newMessage._id);
      await conversation.save();
      req.io.to(receiverId.toString()).emit("newMessage", newMessage);
    }

    res.status(201).json(newMessage);
  } catch (error) {
    console.error("❌ Error in sendMessage controller:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};
