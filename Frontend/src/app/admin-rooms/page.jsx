
"use client";

import { useEffect, useState } from "react";

export default function AdminRoomsPage() {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  // Fetch all rooms
  const fetchRooms = async () => {
    try {
      const res = await fetch("https://translatechatapp.onrender.com/api/rooms");
      const data = await res.json();
      setRooms(data);
    } catch (err) {
      console.error("❌ Failed to fetch rooms:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  // Create a new room
  const createRoom = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("https://translatechatapp.onrender.com/api/rooms", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, description }),
      });

      if (!res.ok) throw new Error("Failed to create room");

      setName("");
      setDescription("");
      fetchRooms(); // refresh the list
    } catch (err) {
      console.error("❌ Error creating room:", err);
    }
  };

  if (loading) return <div className="p-6 text-lg">Loading rooms...</div>;

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Admin Rooms</h1>

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

      {/* Room List */}
      {rooms.length === 0 ? (
        <p>No rooms yet. Create one above!</p>
      ) : (
        <ul className="space-y-3">
          {rooms.map((room) => (
            <li
              key={room._id}
              className="border rounded-lg p-4 hover:bg-gray-100 transition"
            >
              <h2 className="font-semibold">{room.name}</h2>
              <p className="text-sm text-gray-600">{room.description}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
