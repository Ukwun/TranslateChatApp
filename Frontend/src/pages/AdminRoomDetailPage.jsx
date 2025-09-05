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
    // Simulate online users
    setOnlineUsers([
      { _id: "1", fullName: "Alice" },
      { _id: "2", fullName: "Bob" },
      { _id: "3", fullName: "Charlie" },
    ]);
  }, []);

  useEffect(() => {
    if (!room) return;
    // Simulate members fetch
    setMembers(room.members || []);
  }, [room]);

  // Invite user to room (simulate)
  const handleInvite = async () => {
    if (!room || !inviteUserId) return;
    // Replace with backend invite logic
    alert(`Invited user ${inviteUserId} to room ${room.name}`);
    setInviteUserId("");
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
        <h2 className="font-semibold text-lg mb-2">Chat Box</h2>
        <div className="border rounded-lg bg-white min-h-[120px] text-gray-700">
          <ChatBox user={{ _id: "admin", fullName: "Admin" }} room={room} members={members} />
        </div>
      </div>
    </div>
  );
}
