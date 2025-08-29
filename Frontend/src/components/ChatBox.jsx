import React, { useEffect, useState, useRef } from "react";
import io from "socket.io-client";
import toast from "react-hot-toast";
import { useThemeStore } from "../store/useThemeStore";
import { useTranslation } from "react-i18next";
// Use backend URL for socket.io in production, relative path in development
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";
const socket = io(
  typeof window !== "undefined" && window.location.hostname === "localhost"
    ? "/"
    : BACKEND_URL,
  {
    withCredentials: true,
    path: "/socket.io",
  }
);

export default function ChatBox({ user, currentChatUser }) {
  const { t } = useTranslation();
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [image, setImage] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const imageInputRef = useRef(null);
  const { theme } = useThemeStore();

  // Fetch messages when chat user changes
  useEffect(() => {
    const getMessages = async () => {
      if (!currentChatUser?._id) return;
      setMessages([]); // Clear previous messages
      try {
        const res = await fetch(`/api/messages/${currentChatUser._id}`, {
          credentials: "include",
        });
        const data = await res.json();
        if (res.ok) {
          setMessages(data);
        } else {
          toast.error(data.message || "Failed to fetch messages");
        }
      } catch (error) {
        toast.error("Failed to fetch messages");
        console.error("Failed to fetch messages:", error);
      }
    };
    getMessages();
  }, [currentChatUser]);

  // Socket.IO listeners
  useEffect(() => {
    if (!user?._id || !currentChatUser?._id) return;

    socket.emit("join", user._id);

    const handleNewMessage = (msg) => {
      if (msg.senderId === currentChatUser._id || msg.receiverId === currentChatUser._id) {
        setMessages((prev) => [...prev, msg]);
      }
    };

    const handleTyping = (typingUserId) => {
      if (typingUserId === currentChatUser._id) {
        setIsTyping(true);
        setTimeout(() => setIsTyping(false), 1500);
      }
    };

    socket.on("newMessage", handleNewMessage);
    socket.on("typing", handleTyping);

    return () => {
      socket.off("newMessage", handleNewMessage);
      socket.off("typing", handleTyping);
    };
  }, [user, currentChatUser]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        // Only set image if it's a valid image file
        if (reader.result.startsWith("data:image")) {
          setImage(reader.result);
        } else {
          toast.error("Please select a valid image file.");
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const sendMessage = async () => {
    if (!text.trim() && !image) return;

    try {
      const res = await fetch(`/api/messages/send/${currentChatUser._id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ text, image }),
      });

      const data = await res.json();
      if (res.ok) {
        setMessages((prev) => [...prev, data]);
        setText("");
        setImage(null);
        if (imageInputRef.current) {
          imageInputRef.current.value = "";
        }
      } else {
        toast.error(data.message || "Failed to send message");
      }
    } catch (error) {
      toast.error("Failed to send message");
      console.error("Failed to send message:", error);
    }
  };

  // Emit typing event
  const handleTyping = (e) => {
    setText(e.target.value);
    socket.emit("typing", currentChatUser._id);
  };

  return (
    <div className="flex flex-1 flex-col h-full bg-gradient-to-b from-gray-900 to-black text-white">
      {/* Chat Header with typing indicator */}
      <div className="px-4 py-3 border-b border-gray-700 bg-black flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-white font-medium" style={{ backgroundColor: theme }}>
            {currentChatUser.profilePic ? (
              <img src={currentChatUser.profilePic} alt="Profile" className="w-full h-full object-cover rounded-full" />
            ) : (
              currentChatUser.fullName?.charAt(0) || "U"
            )}
          </div>
          <div>
            <h3 className="font-medium text-lg text-white">{currentChatUser.fullName}</h3>
            <p className="text-xs text-white">{t('online')}</p>
          </div>
        </div>
        {isTyping && (
          <div className="flex items-center gap-2">
            <span className="animate-bounce text-white">Typing...</span>
          </div>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((msg) => {
          // Always show translatedText for received messages
          const isReceived = msg.senderId !== user._id;
          return (
            <div
              key={msg._id}
              className={`flex flex-col p-3 rounded-xl max-w-[70%] ${
                msg.senderId === user._id
                  ? "ml-auto" : "mr-auto"
              }`}
              style={{
                backgroundColor: msg.senderId === user._id ? theme : "#374151",
                color: "white"
              }}
            >
              {isReceived && msg.translatedText ? (
                <>
                  <p className="text-white font-bold">{msg.translatedText}</p>
                  {msg.originalText && (
                    <p className="text-xs text-gray-300 mt-1">{t('originalText')}: {msg.originalText}</p>
                  )}
                </>
              ) : (
                msg.text && <p className="text-white">{msg.text}</p>
              )}
              {msg.image && <img src={msg.image} alt={t('messageContent')} className="rounded-lg mt-2 max-w-xs" />}
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
          onClick={() => imageInputRef.current && imageInputRef.current.click()}
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-white">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5V7.5A2.25 2.25 0 015.25 5.25h13.5A2.25 2.25 0 0121 7.5v9a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 16.5z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 12.75l2.25 3 3-4.5 4.5 6" />
          </svg>
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
          onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
          placeholder={t('typeMessage')}
          className="flex-1 p-2 mx-2 rounded-xl bg-gray-800 text-white outline-none"
        />
        <button
          onClick={sendMessage}
          className="px-4 py-2 rounded-xl text-white"
          style={{ backgroundColor: theme }}
        >
          {t('send')}
        </button>
      </div>
    </div>
  );
}