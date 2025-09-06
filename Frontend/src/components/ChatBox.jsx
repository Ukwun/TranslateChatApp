import React, { useEffect, useState, useRef } from "react";
import toast from "react-hot-toast";
import { useThemeStore } from "../store/useThemeStore";
import { useTranslation } from "react-i18next";
import api from "../api/api";
import { useSocketStore } from "../store/useSocket";

export default function ChatBox({ user, currentChatUser, room, members }) {
  const { t } = useTranslation();
  const { theme } = useThemeStore();

  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [image, setImage] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const { socket } = useSocketStore();
  const messagesEndRef = useRef(null);
  const imageInputRef = useRef(null);

  // ✅ Fetch messages
  useEffect(() => {
    const getMessages = async () => {
      setMessages([]);
      try {
        if (currentChatUser?._id) {
          // A 1-on-1 chat takes precedence over a room chat
          const res = await api.get(`/messages/${currentChatUser._id}`);
          setMessages(res.data || []);
        } else if (room?._id) {
          // Fallback to room-wide chat. NOTE: This endpoint `/messages/room/${room._id}` might need to be created on the backend.
          const res = await api.get(`/messages/room/${room._id}`);
          setMessages(res.data || []);
        }
      } catch (error) {
        if (error.response?.status === 404) {
          toast.error("No messages found.");
        } else {
          toast.error(error.response?.data?.message || "Failed to fetch messages");
        }
        console.error("❌ Fetch messages error:", error);
      }
    };
    getMessages();
  }, [user, currentChatUser, room]);

  // ✅ Socket listeners
  useEffect(() => {
    if (!socket || !user) return;

    // Join the room for real-time messages
    if (room?._id) {
      socket.emit("joinRoom", room._id);
    }

    const handleReceiveMessage = (message) => {
      // Only update if the message is for the current room OR a private chat
      const isForCurrentRoom = message.roomId && message.roomId === room?._id;      const isForCurrentPrivateChat = !message.roomId && currentChatUser && ((message.senderId === user._id && message.receiverId === currentChatUser._id) || (message.senderId === currentChatUser._id && message.receiverId === user._id));
      if (isForCurrentRoom || isForCurrentPrivateChat) {
        setMessages((prev) => {
          // prevent duplicates
          if (prev.some((m) => m._id === message._id)) return prev;
          return [...prev, message];
        });
      }
    };

    const handleTyping = (typingData) => {
      if (typingData.roomId === room?._id && typingData.userId !== user._id) {
        setIsTyping(true);
        setTimeout(() => setIsTyping(false), 2000);
      }
    };

    socket.on("receiveMessage", handleReceiveMessage);
    socket.on("typing", handleTyping);
    return () => {
      socket.off("receiveMessage", handleReceiveMessage);
      socket.off("typing", handleTyping);
    };
  }, [socket, room?._id, currentChatUser, user]);

  // ✅ Auto scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ✅ Send message
  const sendMessage = async () => {
    if (!text.trim() && !image) {
      toast.error("Type a message or select an image.");
      return;
    }
    if (!socket) return toast.error("Not connected to chat server.");
    setIsSending(true);

        try {
            const formData = new FormData();
            if (text.trim()) formData.append("text", text);
            if (image && imageInputRef.current?.files[0]) {
                formData.append("image", imageInputRef.current.files[0]);
            }

            if (room?._id) {
                formData.append("roomId", room._id);
            } else if (currentChatUser?._id) {
                formData.append("receiverId", currentChatUser._id);
            } else {
                throw new Error("No recipient for message");
            }

            const res = await api.post("/messages/send", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            // The message is sent via socket from the backend, so we don't need to add it here manually.
            // The `handleReceiveMessage` socket listener will add it for everyone, including the sender.
            setText("");
            setImage(null);
            if (imageInputRef.current) imageInputRef.current.value = "";
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to send message");
            console.error("❌ Send message error:", error);
        } finally {
            setIsSending(false);
        }
  };

  const handleTyping = (e) => {
    setText(e.target.value);
    if (!socket) return;
    // In a room context, emit typing to the room
    if (room?._id) socket.emit("typing", { roomId: room._id, userId: user._id });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) setImage(file);
  };

  return (
    <div className="flex flex-1 flex-col h-full bg-gradient-to-b from-gray-900 to-black text-white">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-700 bg-black flex items-center justify-between">
        <div className="flex items-center gap-3">
          {room ? (
            <>
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-white font-medium"
                style={{ backgroundColor: theme }}
              >
                {room.name.charAt(0)}
              </div>
              <div>
                <h3 className="font-medium text-lg text-white">{room.name}</h3>
                <div className="flex gap-2 mt-1">
                  {members?.map((m) => (
                    <img
                      key={m._id}
                      src={m.profilePic || "/avatar-placeholder.png"}
                      alt={m.fullName}
                      className="w-6 h-6 rounded-full object-cover border-2 border-white"
                      title={m.fullName}
                    />
                  ))}
                </div>
              </div>
            </>
          ) : (
            <>
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-white font-medium"
                style={{ backgroundColor: theme }}
              >
                {currentChatUser?.profilePic ? (
                  <img
                    src={currentChatUser.profilePic}
                    alt="Profile"
                    className="w-full h-full object-cover rounded-full"
                  />
                ) : (
                  currentChatUser?.fullName?.charAt(0) || "U"
                )}
              </div>
              <div>
                <h3 className="font-medium text-lg text-white">
                  {currentChatUser?.fullName}
                </h3>
                <p className="text-xs text-white">{t("online")}</p>
              </div>
            </>
          )}
        </div>
        {isTyping && <span className="animate-bounce text-white">Typing...</span>}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((msg) => {
          const isMine = msg.senderId === user._id;
          return (
            <div
              key={msg._id}
              className={`flex flex-col p-3 rounded-xl max-w-[70%] ${
                isMine ? "ml-auto" : "mr-auto"
              }`}
              style={{
                backgroundColor: isMine ? theme : "#374151",
                color: "white",
              }}
            >
              {!isMine && msg.translatedText ? (
                <>
                  <p className="text-white font-bold">{msg.translatedText}</p>
                  {msg.originalText && (
                    <p className="text-xs text-gray-300 mt-1">
                      {t("originalText")}: {msg.originalText}
                    </p>
                  )}
                </>
              ) : (
                msg.text && <p>{msg.text}</p>
              )}
              {msg.image && (
                <img
                  src={msg.image}
                  alt={t("messageContent")}
                  className="rounded-lg mt-2 max-w-xs"
                />
              )}
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-3 border-t border-gray-700 flex items-center bg-black">
        <button
          type="button"
          className="mr-2 flex items-center justify-center w-10 h-10 rounded-full bg-gray-800 hover:bg-gray-700"
          onClick={() => imageInputRef.current?.click()}
        >
          📷
        </button>
        <input
          type="file"
          accept="image/*"
          ref={imageInputRef}
          onChange={handleImageChange}
          className="hidden"
        />
        <input
          type="text"
          value={text}
          onChange={handleTyping}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          placeholder={t("typeMessage")}
          className="flex-1 p-2 mx-2 rounded-xl bg-gray-800 text-white outline-none"
        />
        <button
          onClick={sendMessage}
          className="px-4 py-2 rounded-xl text-white flex items-center justify-center"
          style={{ backgroundColor: theme }}
          disabled={isSending}
        >
          {isSending ? "..." : t("send")}
        </button>
      </div>
    </div>
  );
}
