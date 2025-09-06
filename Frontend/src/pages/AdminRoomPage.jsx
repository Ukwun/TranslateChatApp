
"use client";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import api from "../api/api.js";

export default function AdminRoomsPage() {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newRoomName, setNewRoomName] = useState("");

  const fetchRooms = async () => {
    try {
      const res = await api.get("/rooms");
      setRooms(res.data);
    } catch (err) {
      console.error("Failed to fetch rooms:", err);
      toast.error(err.response?.data?.message || "Failed to fetch rooms");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  const handleCreateRoom = async (e) => {
    e.preventDefault();
    if (!newRoomName.trim()) {
      return toast.error("Room name cannot be empty.");
    }
    try {
      const res = await api.post("/rooms", { name: newRoomName });
      setRooms([res.data, ...rooms]);
      setNewRoomName("");
      toast.success("Room created successfully!");
    } catch (err) {
      console.error("Failed to create room:", err);
      toast.error(err.response?.data?.message || "Failed to create room");
    }
  };

  if (loading) return <p>Loading rooms...</p>;

  // Delete room
  const handleDeleteRoom = async (roomId) => {
    if (!window.confirm("Are you sure you want to delete this room?")) return;
    try {
      await api.delete(`/rooms/${roomId}`);
      setRooms(rooms.filter((r) => r._id !== roomId));
      toast.success("Room deleted successfully");
    } catch (err) {
      console.error("Failed to delete room:", err);
      toast.error(err.response?.data?.message || "Failed to delete room");
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">Admin Rooms</h1>

      <form onSubmit={handleCreateRoom} className="mb-6 flex gap-2">
        <input
          type="text"
          value={newRoomName}
          onChange={(e) => setNewRoomName(e.target.value)}
          placeholder="New room name"
          className="input input-bordered w-full max-w-xs"
        />
        <button type="submit" className="btn btn-primary">
          Create Room
        </button>
      </form>

      {rooms.length === 0 && !loading && <p>No rooms created yet. Create one above!</p>}

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
