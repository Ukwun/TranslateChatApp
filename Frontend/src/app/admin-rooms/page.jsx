

"use client";
import { useEffect, useState } from "react";
import ChatBox from "../../components/ChatBox";

export default function AdminRoomsPage() {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [members, setMembers] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [inviteUserId, setInviteUserId] = useState("");

  // Get adminId from localStorage (set after login)
  const [adminId, setAdminId] = useState("");
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("authUser"));
    if (user && user._id) setAdminId(user._id);
  }, []);

  // Fetch rooms for this admin
  const fetchRooms = async () => {
    if (!adminId) return;
    setLoading(true);
    try {
      const res = await fetch(`https://translatechatapp.onrender.com/api/admin/rooms?adminId=${adminId}`);
      if (!res.ok) throw new Error("Failed to fetch rooms");
      const data = await res.json();
      setRooms(data);
      setError("");
    } catch (err) {
      setError("❌ Failed to fetch rooms: " + err.message);
      setRooms([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (adminId) fetchRooms();
  }, [adminId]);

  // Fetch online users (simulate for demo)
  useEffect(() => {
    // Replace with your backend endpoint for online users
    setOnlineUsers([
      { _id: "1", fullName: "Alice" },
      { _id: "2", fullName: "Bob" },
      { _id: "3", fullName: "Charlie" },
    ]);
  }, []);

  // Fetch members for selected room
  useEffect(() => {
    if (!selectedRoom) {
      setMembers([]);
      return;
    }
    fetch(`https://translatechatapp.onrender.com/api/admin/${selectedRoom._id}/members`)
      .then(res => res.json())
      .then(data => setMembers(data))
      .catch(() => setMembers([]));
  }, [selectedRoom]);

  // Create a new room
  const createRoom = async (e) => {
    e.preventDefault();
    if (!adminId) return;
    try {
      const res = await fetch(`https://translatechatapp.onrender.com/api/admin/rooms`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description, adminId, invitedUserIds: [] }),
      });
      if (!res.ok) throw new Error("Failed to create room");
      setName("");
      setDescription("");
      fetchRooms();
    } catch (err) {
      setError("❌ Error creating room: " + err.message);
    }
  };

  // Invite user to room (real backend)
  const handleInvite = async () => {
    if (!selectedRoom || !inviteUserId) return;
    try {
      const res = await fetch(`https://translatechatapp.onrender.com/api/admin/${selectedRoom._id}/invite`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: inviteUserId }),
      });
      if (!res.ok) throw new Error("Failed to invite user");
      // Refresh members list
      fetch(`https://translatechatapp.onrender.com/api/admin/${selectedRoom._id}/members`)
        .then(res => res.json())
        .then(data => setMembers(data));
      setInviteUserId("");
    } catch (err) {
      setError("❌ Error inviting user: " + err.message);
    }
  };

  if (loading) return <div className="p-6 text-lg">Loading rooms...</div>;

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Admin Room Dashboard</h1>
      {error && <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-xl text-center font-semibold">{error}</div>}

      {/* Create Room Form */}
      <form
        onSubmit={createRoom}
        className="space-y-4 mb-8 border p-4 rounded-lg shadow"
      >
        <input
          type="text"
          placeholder="Room name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="w-full p-2 border rounded"
        />
        <textarea
          placeholder="Room description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full p-2 border rounded"
        />
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Create Room
        </button>
      </form>

      <div className="flex gap-10">
        {/* Room List */}
        <div className="flex-1">
          <h2 className="font-semibold text-xl text-blue-700 mb-4">Rooms You Admin</h2>
          <ul className="space-y-3">
            {rooms.length === 0 && <li className="text-gray-400">No rooms yet. Create one above!</li>}
            {rooms.map(room => (
              <li key={room._id}>
                <button className="w-full text-left px-5 py-3 rounded-xl bg-blue-100 text-blue-800 font-semibold shadow-lg hover:bg-blue-200 transition text-lg" onClick={() => setSelectedRoom(room)}>
                  {room.name}
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Room Details */}
        {selectedRoom ? (
          <div className="flex-1">
            <h2 className="font-semibold text-xl text-blue-700 mb-4">Members in {selectedRoom.name}</h2>
            <ul className="space-y-3">
              {members.length === 0 && <li className="text-gray-400">No members in this room yet. Invite users below.</li>}
              {members.map(member => (
                <li key={member._id} className="flex items-center gap-4 bg-gray-100 rounded-xl px-5 py-3 shadow-lg">
                  <span className="font-semibold text-gray-800">{member.fullName}</span>
                </li>
              ))}
            </ul>

            {/* Online Users & Invite */}
            <div className="mt-8">
              <h3 className="font-semibold text-lg text-blue-700 mb-2">Invite Online User</h3>
              <select value={inviteUserId} onChange={e => setInviteUserId(e.target.value)} className="border rounded p-2 w-full mb-2">
                <option value="">Select user...</option>
                {onlineUsers.map(user => (
                  <option key={user._id} value={user._id}>{user.fullName}</option>
                ))}
              </select>
              <button className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700" onClick={handleInvite}>Invite</button>
            </div>

            {/* Real chat box */}
            <div className="mt-8 p-0 rounded-xl bg-gray-50 shadow-lg">
              <h4 className="font-bold text-blue-700 mb-2">Chat Room: {selectedRoom.name}</h4>
              <div className="border rounded-lg bg-white min-h-[120px] text-gray-700">
                <ChatBox
                  user={{ _id: adminId, fullName: "Admin" }}
                  room={selectedRoom}
                  members={members}
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-400 text-lg">
            Select a room to view members, invite users, and chat.
          </div>
        )}
      </div>
    </div>
  );
}
