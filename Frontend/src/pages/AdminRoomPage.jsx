
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

  // Delete room
  const handleDeleteRoom = async (roomId) => {
    if (!window.confirm("Are you sure you want to delete this room?")) return;
    try {
      await fetch(`https://translatechatapp.onrender.com/api/rooms/${roomId}`, {
        method: "DELETE"
      });
      setRooms(rooms.filter(r => r._id !== roomId));
    } catch (err) {
      alert("Failed to delete room");
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">Admin Rooms</h1>
      <ul className="space-y-4">
        {rooms.map((room) => (
          <li
            key={room._id}
            className="relative border rounded-lg p-4 hover:bg-gray-100 transition"
          >
            <div className="flex justify-between items-center">
              <div
                className="cursor-pointer flex-1"
                onClick={() => (window.location.href = `/admin-rooms/${room._id}`)}
              >
                <h2 className="font-semibold">{room.name}</h2>
                <p className="text-sm text-gray-600">{room.description}</p>
              </div>
              <button
                className="ml-2 p-2 rounded-full hover:bg-gray-200"
                title="Room options"
                onClick={e => {
                  e.stopPropagation();
                  handleDeleteRoom(room._id);
                }}
              >
                <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-600"><circle cx="12" cy="5" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="12" cy="19" r="1.5"/></svg>
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
