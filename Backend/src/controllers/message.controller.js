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

// ✅ Send a message
export const sendMessage = async (req, res) => {
  try {
    const senderId = req.user._id;
    const receiverId = req.params.id;
    const { text, image, roomId } = req.body;

    if (roomId) {
      const room = await ChatRoom.findById(roomId);
      if (!room || !room.members.includes(senderId) || !room.members.includes(receiverId)) {
        return res.status(403).json({ message: "Access denied: Not a member of this room." });
      }
    }

    let imageUrl;
    if (image) {
      const uploadResponse = await cloudinary.uploader.upload(image);
      imageUrl = uploadResponse.secure_url;
    }

    // ✅ Language handling
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

    let translatedText = text;
    let originalText = text;
    if (text && targetLangCode) {
      try {
        const sender = await User.findById(senderId);
        const senderLang = sender?.language || "en";
        if (targetLangCode !== senderLang) {
          translatedText = await translateText(text, targetLangName, process.env.OPENAI_API_KEY);
        }
      } catch (err) {
        console.error("Translation error:", err.message);
      }
    }

    // ✅ Find or create conversation
    let conversation = await Conversation.findOne({
      participants: { $all: [senderId, receiverId] },
    });

    if (!conversation) {
      conversation = await Conversation.create({
        participants: [senderId, receiverId],
        messages: [],
      });
    }

    // ✅ Create new message
    const newMessage = await Message.create({
      senderId,
      receiverId,
      text: translatedText || "",
      image: imageUrl || "",
      originalText: originalText || "",
      translatedText: translatedText || "",
    });

    conversation.messages.push(newMessage._id);
    await conversation.save();

    // ✅ Emit real-time update
    req.io.to(receiverId.toString()).emit("newMessage", newMessage);

    res.status(201).json(newMessage);
  } catch (error) {
    console.error("❌ Error in sendMessage:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};
