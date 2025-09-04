"use client";

import { useEffect, useState } from "react";

export default function AdminRoomsPage() {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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

    fetchRooms();
  }, []);

  if (loading) return <div className="p-6 text-lg">Loading rooms...</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Admin Rooms</h1>
      {rooms.length === 0 ? (
        <p>No rooms yet. Create one from your profile!</p>
      ) : (
        <ul className="space-y-2">
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
