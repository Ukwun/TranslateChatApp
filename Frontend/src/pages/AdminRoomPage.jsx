
"use client";
import { useEffect, useState } from "react";

export default function AdminRoomsPage() {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRooms() {
      try {
        const res = await fetch("https://translatechatapp.onrender.com/api/rooms");
        const data = await res.json();
        setRooms(data);
      } catch (err) {
        console.error("Failed to fetch rooms:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchRooms();
  }, []);

  if (loading) return <p>Loading rooms...</p>;

  if (rooms.length === 0) return <p>No rooms created yet</p>;

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">Admin Rooms</h1>
      <ul className="space-y-4">
        {rooms.map((room) => (
          <li
            key={room._id}
            onClick={() => (window.location.href = `/admin-rooms/${room._id}`)}
            className="cursor-pointer border rounded-lg p-4 hover:bg-gray-100 transition"
          >
            <h2 className="font-semibold">{room.name}</h2>
            <p className="text-sm text-gray-600">{room.description}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
