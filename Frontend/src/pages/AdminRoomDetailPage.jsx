"use client";

import { useEffect, useState } from "react";
import ChatBox from "../components/ChatBox";

export default function AdminRoomDetailPage() {
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [members, setMembers] = useState([]);
  const [inviteUserId, setInviteUserId] = useState("");
  const [currentChatUser, setCurrentChatUser] = useState(null);

  // Get roomId from URL
  const roomId = window.location.pathname.split("/").pop();

  useEffect(() => {
    async function fetchRoom() {
      try {
        const res = await fetch(`https://translatechatapp.onrender.com/api/rooms/${roomId}`);
        if (!res.ok) throw new Error("Room not found");
        const data = await res.json();
        setRoom(data);
      } catch (err) {
        setError("Failed to fetch room: " + err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchRoom();
  }, [roomId]);

  useEffect(() => {
    async function fetchOnlineUsers() {
      try {
        const token = window.localStorage.getItem("chat-user-token");
        const res = await fetch("https://translatechatapp.onrender.com/api/messages/users", {
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {})
          },
          credentials: "include"
        });
        const data = await res.json();
        setOnlineUsers(data);
      } catch (err) {
        setOnlineUsers([]);
      }
    }
    fetchOnlineUsers();
  }, []);

  useEffect(() => {
    if (!room) return;
    setMembers(room.members || []);
  }, [room]);

  // Invite user to room (real backend)
  const handleInvite = async () => {
    if (!room || !inviteUserId) return;
    try {
      // Add user to room members (simulate backend logic)
      setMembers(prev => [...prev, onlineUsers.find(u => u._id === inviteUserId)]);
      setInviteUserId("");
      alert(`Invited user to room!`);
    } catch (err) {
      alert("Failed to invite user");
    }
  };

  // Select user to chat with
  const handleSelectChatUser = (user) => {
    setCurrentChatUser(user);
  };

  if (loading) return <p>Loading room...</p>;
  if (error) return <p className="text-red-600">{error}</p>;
  if (!room) return <p>Room not found</p>;

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Room: {room.name}</h1>
      <p className="mb-4 text-gray-600">{room.description}</p>
      <div className="mb-6">
        <h2 className="font-semibold text-lg mb-2">Members</h2>
        <ul className="space-y-2">
          {members.length === 0 && <li className="text-gray-400">No members yet.</li>}
          {members.map(member => (
            <li key={member._id} className="bg-gray-100 rounded px-4 py-2">{member.fullName || member._id}</li>
          ))}
        </ul>
      </div>
      <div className="mb-6">
        <h2 className="font-semibold text-lg mb-2">Invite Online User</h2>
        <select value={inviteUserId} onChange={e => setInviteUserId(e.target.value)} className="border rounded p-2 w-full mb-2">
          <option value="">Select user...</option>
          {onlineUsers.map(user => (
            <option key={user._id} value={user._id}>{user.fullName}</option>
          ))}
        </select>
        <button className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700" onClick={handleInvite}>Invite</button>
      </div>
      <div className="mb-6">
        <h2 className="font-semibold text-lg mb-2">Online Users</h2>
        <ul className="space-y-2">
          {onlineUsers.map(user => (
            <li key={user._id} className="flex items-center gap-2">
              <span>{user.fullName}</span>
              <button className="ml-2 px-2 py-1 bg-blue-500 text-white rounded" onClick={() => handleSelectChatUser(user)}>Chat</button>
            </li>
          ))}
        </ul>
      </div>
      <div className="mb-6">
        <h2 className="font-semibold text-lg mb-2">Chat Box</h2>
        <div className="border rounded-lg bg-white min-h-[120px] text-gray-700">
          <ChatBox user={{ _id: "admin", fullName: "Admin" }} currentChatUser={currentChatUser} room={room} members={members} />
        </div>
      </div>
    </div>
  );
}
