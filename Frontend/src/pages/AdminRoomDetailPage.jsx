"use client";

import { useEffect, useState } from "react";
import ChatBox from "../components/ChatBox";
import api from "../api/api.js";
import toast from "react-hot-toast";

export default function AdminRoomDetailPage() {
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [inviteUserId, setInviteUserId] = useState("");
  const [currentChatUser, setCurrentChatUser] = useState(null);

  // Get roomId from URL
  const roomId = window.location.pathname.split("/").pop();

  // ✅ Fetch room details
  useEffect(() => {
    async function fetchRoom() {
      try {
        const res = await api.get(`/rooms/${roomId}`);
        setRoom(res.data);
      } catch (err) {
        toast.error(err.response?.data?.message || "Failed to fetch room details");
      } finally {
        setLoading(false);
      }
    }
    fetchRoom();
  }, [roomId]);

  // ✅ Fetch online users
  useEffect(() => {
    async function fetchOnlineUsers() {
      try {
        const res = await api.get("/messages/users");
        setOnlineUsers(res.data);
      } catch (err) {
        setOnlineUsers([]);
        console.error("Failed to fetch online users:", err);
      }
    }
    fetchOnlineUsers();
  }, []);

  // ✅ Invite user to room
  async function handleInvite() {
    if (!room || !inviteUserId) return;
    try {
      const res = await api.post(`/rooms/${roomId}/invite`, { userId: inviteUserId });
      setRoom(res.data);
      setInviteUserId("");
      toast.success("User invited successfully!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to invite user");
    }
  }

  // ✅ Select user to chat with
  const handleSelectChatUser = (user) => {
    setCurrentChatUser(user);
  };

  // ✅ Loading / error / no room states
  if (loading) return <p>Loading room...</p>;
  if (!room) return <p>Room not found</p>;

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Room: {room.name}</h1>
      <p className="mb-4 text-gray-600">{room.description}</p>

      {/* Members List */}
      <div className="mb-6">
        <h2 className="font-semibold text-lg mb-2">Members</h2>
        <ul className="space-y-2">
          {room.members?.length === 0 && (
            <li className="text-gray-400">No members yet.</li>
          )}
          {room.members?.map((member) => (
            <li
              key={member._id}
              className="bg-gray-100 rounded px-4 py-2"
            >
              {member.fullName || member.username || member._id}
            </li>
          ))}
        </ul>
      </div>

      {/* Invite Users */}
      <div className="mb-6">
        <h2 className="font-semibold text-lg mb-2">Invite Online User</h2>
        <select
          value={inviteUserId}
          onChange={(e) => setInviteUserId(e.target.value)}
          className="border rounded p-2 w-full mb-2"
        >
          <option value="">Select user...</option>
          {onlineUsers.map((user) => (
            <option key={user._id} value={user._id}>
              {user.fullName || user.username}
            </option>
          ))}
        </select>
        <button
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          onClick={handleInvite}
        >
          Invite
        </button>
      </div>

      {/* Online Users */}
      <div className="mb-6">
        <h2 className="font-semibold text-lg mb-2">Online Users</h2>
        <ul className="space-y-2">
          {onlineUsers.map((user) => (
            <li key={user._id} className="flex items-center gap-2">
              <span>{user.fullName || user.username}</span>
              <button
                className="ml-2 px-2 py-1 bg-blue-500 text-white rounded"
                onClick={() => handleSelectChatUser(user)}
              >
                Chat
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Chat Box */}
      <div className="mb-6">
        <h2 className="font-semibold text-lg mb-2">Chat Box</h2>
        <div className="border rounded-lg bg-white min-h-[120px] text-gray-700">
          <ChatBox
            user={{ _id: "admin", fullName: "Admin" }}
            currentChatUser={currentChatUser}
            room={room}
            members={room.members}
          />
        </div>
      </div>
    </div>
  );
}
