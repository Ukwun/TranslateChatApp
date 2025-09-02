import React, { useState } from "react";
import api from "../api/api";

export default function Signup() {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [roomId, setRoomId] = useState("");
  const [rooms, setRooms] = useState([]);
  const [error, setError] = useState("");

  // Fetch available chat rooms
  React.useEffect(() => {
    api.get("/admin/rooms").then(res => setRooms(res.data)).catch(() => setRooms([]));
  }, []);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError("");
    try {
      await api.post("/auth/signup", { ...form, roomId });
      alert("Registration successful! You can now log in.");
    } catch (err) {
      setError(err.response?.data?.message || "Signup failed");
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 border rounded shadow">
      <h2 className="text-xl font-bold mb-4">Membership Registration</h2>
      <form onSubmit={handleSubmit}>
        <input name="name" placeholder="Name" value={form.name} onChange={handleChange} className="w-full mb-2 p-2 border rounded" required />
        <input name="email" type="email" placeholder="Email" value={form.email} onChange={handleChange} className="w-full mb-2 p-2 border rounded" required />
        <input name="password" type="password" placeholder="Password" value={form.password} onChange={handleChange} className="w-full mb-2 p-2 border rounded" required />
        <select value={roomId} onChange={e => setRoomId(e.target.value)} className="w-full mb-2 p-2 border rounded" required>
          <option value="">Select Chat Room</option>
          {rooms.map(room => (
            <option key={room._id} value={room._id}>{room.name}</option>
          ))}
        </select>
        {error && <div className="text-red-500 mb-2">{error}</div>}
        <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded">Sign Up & Join Room</button>
      </form>
    </div>
  );
}
