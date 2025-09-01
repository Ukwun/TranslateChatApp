import React, { useEffect, useState } from "react";
import api from "../api/api";

export default function AdminPage() {
  const [members, setMembers] = useState([]);
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [nicknameEdits, setNicknameEdits] = useState({});
  const [roomMembers, setRoomMembers] = useState([]);
  const [roomName, setRoomName] = useState("");

  // Fetch member list
  const fetchMembers = async () => {
    try {
      const res = await api.get("/admin/members");
      setMembers(res.data);
    } catch (err) {
      alert("Failed to fetch members");
    }
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  // Disable member
  const disableMember = async (id) => {
    await api.post(`/admin/disable/${id}`);
    fetchMembers();
  };

  // Delete member
  const deleteMember = async (id) => {
    await api.delete(`/admin/delete/${id}`);
    fetchMembers();
  };

  // Change nickname
  const changeNickname = async (id, nickname) => {
    await api.put(`/admin/nickname/${id}`, { nickname });
    fetchMembers();
  };

  // Create chat room and invite members
  const createRoom = async () => {
    await api.post("/admin/create-room", {
      name: roomName,
      members: roomMembers,
    });
    setRoomName("");
    setRoomMembers([]);
    alert("Room created and members invited!");
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Administrator Panel</h1>
      <button className="mb-4 px-4 py-2 bg-blue-600 text-white rounded" onClick={fetchMembers}>
        View Member List
      </button>
      <table className="w-full mb-8">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Status</th>
            <th>Nickname</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {members.map((m) => (
            <tr key={m._id}>
              <td>{m.name}</td>
              <td>{m.email}</td>
              <td>{m.disabled ? "Disabled" : "Active"}</td>
              <td>
                <input
                  value={nicknameEdits[m._id] ?? m.nickname ?? ""}
                  onChange={e => setNicknameEdits({ ...nicknameEdits, [m._id]: e.target.value })}
                  className="border px-2"
                />
                <button className="ml-2 px-2 py-1 bg-green-500 text-white rounded" onClick={() => changeNickname(m._id, nicknameEdits[m._id] ?? m.nickname)}>
                  Change
                </button>
              </td>
              <td>
                <button className="px-2 py-1 bg-yellow-500 text-white rounded mr-2" onClick={() => disableMember(m._id)}>
                  Disable
                </button>
                <button className="px-2 py-1 bg-red-600 text-white rounded" onClick={() => deleteMember(m._id)}>
                  Delete
                </button>
                <input type="checkbox" checked={roomMembers.includes(m._id)} onChange={e => {
                  setRoomMembers(e.target.checked ? [...roomMembers, m._id] : roomMembers.filter(id => id !== m._id));
                }} /> Invite
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Create Chat Room</h2>
        <input
          className="border px-2 mr-2"
          placeholder="Room Name"
          value={roomName}
          onChange={e => setRoomName(e.target.value)}
        />
        <button className="px-4 py-2 bg-purple-600 text-white rounded" onClick={createRoom}>
          Create Room & Invite
        </button>
      </div>
    </div>
  );
}
