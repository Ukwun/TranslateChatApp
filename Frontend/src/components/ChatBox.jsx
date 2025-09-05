import React, { useEffect, useState, useRef } from "react";
import io from "socket.io-client";
import toast from "react-hot-toast";
import { useThemeStore } from "../store/useThemeStore";
import { useTranslation } from "react-i18next";
import api from "../api/api";

let socket;

export default function ChatBox({ user, currentChatUser, room, members }) {
  const { t } = useTranslation();
  const { theme } = useThemeStore();

  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [image, setImage] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const messagesEndRef = useRef(null);
  const imageInputRef = useRef(null);

  // ✅ Initialize socket once
  useEffect(() => {
    const token = window.localStorage.getItem("chat-user-token");
    if (!socket) {
      socket = io(
        import.meta.env.VITE_SOCKET_URL ||
          import.meta.env.VITE_BACKEND_URL ||
          "http://localhost:5000",
        {
          withCredentials: true,
          path: "/socket.io",
          transports: ["websocket", "polling"],
          auth: { token },
        }
      );
    }
  }, []);

  // ✅ Fetch messages for room or 1:1
  useEffect(() => {
    const getMessages = async () => {
      setMessages([]);
      try {
        if (room && members?.length > 1) {
          const mainUserId = user?._id;
          const promises = members
            .filter((m) => m._id !== mainUserId)
            .map((m) =>
              api.get(
                `/messages/conversation/${mainUserId}/${m._id}?roomId=${room._id}`
              )
            );
          const results = await Promise.all(promises);
          setMessages(results.flatMap((r) => r.data || []));
        } else if (user?._id && currentChatUser?._id) {
          const res = await api.get(
            `/messages/conversation/${user._id}/${currentChatUser._id}`
          );
          setMessages(res.data || []);
        }
      } catch (error) {
        if (error.response?.status === 404) {
          toast.error("No messages found.");
        } else {
          toast.error(error.response?.data?.message || "Failed to fetch messages");
        }
        console.error("Fetch messages error:", error);
      }
    };
    getMessages();
  }, [user, currentChatUser, room, members]);

  // ✅ Socket listeners
  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = async () => {
      try {
        if (room && members?.length > 1) {
          const mainUserId = user?._id;
          const promises = members
            .filter((m) => m._id !== mainUserId)
            .map((m) =>
              api.get(
                `/messages/conversation/${mainUserId}/${m._id}?roomId=${room._id}`
              )
            );
          const results = await Promise.all(promises);
          setMessages(results.flatMap((r) => r.data || []));
        } else if (user?._id && currentChatUser?._id) {
          const res = await api.get(
            `/messages/conversation/${user._id}/${currentChatUser._id}`
          );
          setMessages(res.data || []);
        }
      } catch {
        toast.error("Failed to sync messages");
      }
    };

    const handleTyping = (typingUserId) => {
      if (typingUserId === currentChatUser?._id) {
        setIsTyping(true);
        setTimeout(() => setIsTyping(false), 1500);
      }
    };

    socket.on("new_message", handleNewMessage);
    socket.on("typing", handleTyping);

    return () => {
      socket.off("new_message", handleNewMessage);
      socket.off("typing", handleTyping);
    };
  }, [user, currentChatUser, room, members]);

  // ✅ Auto-scroll on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ✅ Send message
  const sendMessage = async () => {
    if (!text.trim() && !image) {
      toast.error("Type a message or select an image.");
      return;
    }
    setIsSending(true);

    try {
      if (room && members?.length > 1) {
        const mainUserId = user?._id;
        const sendPromises = members
          .filter((m) => m._id !== mainUserId)
          .map(async (m) => {
            if (image && imageInputRef.current?.files[0]) {
              const form = new FormData();
              form.append("image", imageInputRef.current.files[0]);
              form.append("receiverId", m._id);
              form.append("roomId", room._id);
              await api.post("/messages/send-image", form, {
                headers: { "Content-Type": "multipart/form-data" },
              });
            }
            if (text.trim()) {
              await api.post("/messages/send-text", {
                receiverId: m._id,
                text,
                roomId: room._id,
              });
            }
          });
        await Promise.all(sendPromises);
      } else if (user?._id && currentChatUser?._id) {
        if (image && imageInputRef.current?.files[0]) {
          const form = new FormData();
          form.append("image", imageInputRef.current.files[0]);
          form.append("receiverId", currentChatUser._id);
          await api.post("/messages/send-image", form, {
            headers: { "Content-Type": "multipart/form-data" },
          });
        }
        if (text.trim()) {
          await api.post("/messages/send-text", {
            receiverId: currentChatUser._id,
            text,
          });
        }
      }

      setText("");
      setImage(null);
      if (imageInputRef.current) imageInputRef.current.value = "";
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to send message");
      console.error("Send message error:", error);
    } finally {
      setIsSending(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) setImage(file);
  };

  const handleTyping = (e) => {
    setText(e.target.value);
    if (room) {
      const mainUserId = user?._id;
      const otherMember = members?.find((m) => m._id !== mainUserId);
      if (otherMember?._id) socket.emit("typing", otherMember._id);
    } else if (currentChatUser?._id) {
      socket.emit("typing", currentChatUser._id);
    }
  };

  return (
    <div className="flex flex-1 flex-col h-full bg-gradient-to-b from-gray-900 to-black text-white">
      {/* Chat Header */}
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
          const isReceived = msg.senderId !== user._id;
          return (
            <div
              key={msg._id}
              className={`flex flex-col p-3 rounded-xl max-w-[70%] ${
                msg.senderId === user._id ? "ml-auto" : "mr-auto"
              }`}
              style={{
                backgroundColor:
                  msg.senderId === user._id ? theme : "#374151",
                color: "white",
              }}
            >
              {isReceived && msg.translatedText ? (
                <>
                  <p className="text-white font-bold">{msg.translatedText}</p>
                  {msg.originalText && (
                    <p className="text-xs text-gray-300 mt-1">
                      {t("originalText")}: {msg.originalText}
                    </p>
                  )}
                </>
              ) : (
                msg.text && <p className="text-white">{msg.text}</p>
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
