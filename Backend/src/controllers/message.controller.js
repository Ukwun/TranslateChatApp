import User from "../models/user.model.js";
import Conversation from "../models/conversation.model.js";
import Message from "../models/message.model.js";
import ChatRoom from "../models/chatroom.model.js";
import cloudinary from "../lib/cloudinary.js";
import { translateText } from "../lib/translate.js";

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
    const senderId = req.user._id;
    const receiverId = req.params.id;
    const { roomId } = req.query;

    // Restrict to members/admins of the room
    if (roomId) {
      const room = await ChatRoom.findById(roomId);
      if (!room || !room.members.includes(senderId) || !room.members.includes(receiverId)) {
        return res.status(403).json({ message: "Access denied: Not a member of this room." });
      }
    }

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


// Send message
export const sendMessage = async (req, res) => {
  try {
    const senderId = req.user._id;
    const receiverId = req.params.id;
    const { text, image, roomId } = req.body;

    // Restrict to members/admins of the room
    if (roomId) {
      const room = await ChatRoom.findById(roomId);
      if (!room || !room.members.includes(senderId) || !room.members.includes(receiverId)) {
        return res.status(403).json({ message: "Access denied: Not a member of this room." });
      }
    }

    let imageUrl;
    if (image) {
      // Upload base64 image to cloudinary
      const uploadResponse = await cloudinary.uploader.upload(image);
      imageUrl = uploadResponse.secure_url;
    }

    // Get receiver's language and map to readable name for OpenAI
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
      it: "Italian"
    };
    const targetLangCode = receiver?.language || "en";
    const targetLangName = langMap[targetLangCode] || "English";

    // Always translate text to receiver's preferred language
    let translatedText = text;
    let originalText = text;
    if (text && targetLangCode) {
      try {
        // Only skip translation if sender and receiver language are the same
        const sender = await User.findById(senderId);
        const senderLang = sender?.language || "en";
        if (targetLangCode !== senderLang) {
          translatedText = await translateText(text, targetLangName, process.env.OPENAI_API_KEY);
        }
      } catch (err) {
        console.error("Translation error:", err.message);
      }
    }

    let conversation = await Conversation.findOne({
      participants: { $all: [senderId, receiverId] },
    });

    if (!conversation) {
      conversation = await Conversation.create({
        participants: [senderId, receiverId],
        messages: [],
      });
    }

    // Always set originalText and translatedText, even for image-only messages
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

    req.io.to(receiverId.toString()).emit("newMessage", newMessage);

    res.status(201).json(newMessage);
  } catch (error) {
    console.error("❌ Error in sendMessage controller:", error.message);
    res.status(500).json({ message: "Server error" });
  }
};