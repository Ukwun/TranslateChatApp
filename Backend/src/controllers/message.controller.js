import User from "../models/user.model.js";
import Conversation from "../models/conversation.model.js";
import Message from "../models/message.model.js";
import cloudinary from "../lib/cloudinary.js";
import { translateText } from "../services/translation.service.js";
import { detectISO1 } from "../lib/langDetect.js";
// Improved sendTextMessage with language detection and translation
export const sendTextMessage = async (req, res) => {
  try {
    const senderId = req.userId || req.user?._id;
    const { receiverId, text, sourceLang } = req.body;

    if (!receiverId || !text) {
      return res.status(400).json({ message: "receiverId and text are required" });
    }

    const receiver = await User.findById(receiverId).lean();
    if (!receiver) return res.status(404).json({ message: "Receiver not found" });

    const src = (sourceLang || detectISO1(text)).toLowerCase();
    const tgt = (receiver.preferredLang || "en").toLowerCase();

    let translated = text;
    let model = "noop";

    if (src !== tgt) {
      const out = await translateText({ text, source: src, target: tgt });
      translated = out.translated;
      model = out.model;
    }

    const msg = await Message.create({
      _id: new mongoose.Types.ObjectId(),
      sender: senderId,
      receiver: receiverId,
      textOriginal: text,
      textTranslated: translated,
      srcLang: src,
      tgtLang: tgt,
      translatorModel: model,
      type: "text",
      createdAt: new Date(),
    });

    const payload = msg.toObject ? msg.toObject() : msg;

    // Emit to receiver and sender (so both UIs update)
    req.io?.to(String(receiverId)).emit("new_message", payload);
    req.io?.to(String(senderId)).emit("new_message", payload);

    return res.status(201).json({ message: "Message sent", data: payload });
  } catch (err) {
    console.error("sendTextMessage error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};
import mongoose from "mongoose";
import ChatRoom from "../models/chatroom.model.js";

// Get all messages between two users (for frontend conversation fetch)
export const getConversationMessages = async (req, res) => {
  try {
    const { userId, chatUserId } = req.params;
    // Find conversation with both participants
    const conversation = await Conversation.findOne({
      participants: { $all: [userId, chatUserId] },
    }).populate("messages");
    if (!conversation) {
      return res.status(200).json([]);
    }
    res.status(200).json(conversation.messages);
  } catch (error) {
    console.error("❌ Error in getConversationMessages controller:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};

export const getUsersForSidebar = async(req, res) => {
    try {
        const loggedInUserId = req.user._id;
        const filteredUsers = await User.find({ _id: { $ne:loggedInUserId } }).select("-password");

        res.status(200).json(filteredUsers);
    } catch (error) {
        console.error("Error in getUsersForSidebar: ", error.message);
        res.status(500).json({ error: "Internal Server Error"});
    }
};


// Get messages in a conversation
export const getMessages = async (req, res) => {
  try {
    const senderId = req.user._id; // ✅ FIXED here
    const receiverId = req.params.id;

    const conversation = await Conversation.findOne({
      participants: { $all: [senderId, receiverId] },
    }).populate("messages");

    if (!conversation) {
      return res.status(200).json([]);
    }

    res.status(200).json(conversation.messages);
  } catch (error) {
    console.error("❌ Error in getMessages controller:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};


// Only allow chat if both users are in the same admin-created chat room
export const canChat = async (userA, userB) => {
  const room = await ChatRoom.findOne({ members: { $all: [userA, userB] } });
  return !!room;
};

// Send message
export const sendMessage = async (req, res) => {
  try {
    const senderId = req.user._id;
    const receiverId = req.params.id;
    const { text, image } = req.body;

    // Check if chat is allowed between sender and receiver
    if (!(await canChat(senderId, receiverId))) {
      return res.status(403).json({ message: "Chat not allowed" });
    }

    let imageUrl;
    if (image) {
      // Upload base64 image to cloudinary
      const uploadResponse = await cloudinary.uploader.upload(image);
      imageUrl = uploadResponse.secure_url;
    }

      // Translate message using OPUS-MT FastAPI microservice
      let translatedText = text || "";
      try {
        // You may want to determine srcLang and tgtLang dynamically; here we use 'en' to 'es' as example
        const srcLang = req.body.srcLang || "en";
        const tgtLang = req.body.tgtLang || "es";
        if (text) {
          translatedText = await translateTextOpusMT(text, srcLang, tgtLang);
        }
      } catch (err) {
        console.error("Translation failed, using original text.", err);
        translatedText = text || "";
      }

      // Save message with original and translated text
      const newMessage = await Message.create({
        senderId,
        receiverId,
        text: translatedText,
        image: imageUrl || "",
        originalText: text || "",
        translatedText: translatedText,
      });

      // Emit to both sender and receiver rooms
      req.io.to(receiverId.toString()).emit("new_message", newMessage);
      req.io.to(senderId.toString()).emit("new_message", newMessage);

      res.status(201).json(newMessage);
  } catch (error) {
    console.error("❌ Error in sendMessage controller:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};


export const sendImageMessage = async (req, res) => {
  try {
    const senderId = req.userId;
    const { receiverId } = req.body;
    if (!req.file || !receiverId) return res.status(400).json({ message: "Missing file or receiver" });

    const imageUrl = await cloudinary.uploader.upload(req.file.path || req.file.buffer);

    const msg = await Message.create({
      _id: new mongoose.Types.ObjectId(),
      senderId,
      receiverId,
      image: imageUrl.secure_url,
      type: "image",
      createdAt: new Date(),
    });

    const payload = { ...msg.toObject() };
    if (req.io) {
      req.io.to(String(receiverId)).emit("new_message", payload);
      req.io.to(String(senderId)).emit("new_message", payload);
    }

    return res.status(201).json({ message: "Image sent", data: payload });
  } catch (err) {
    console.error("sendImageMessage error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};