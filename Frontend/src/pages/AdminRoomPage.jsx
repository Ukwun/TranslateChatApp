import React, { useEffect, useState } from "react";
import api from "../api/api";
import { useAuthStore } from "../store/useAuthStore";

const AdminRoomPage = () => {
  const { authUser } = useAuthStore();
  const [rooms, setRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [members, setMembers] = useState([]);
  const [nickname, setNickname] = useState("");
  const [newRoomName, setNewRoomName] = useState("");
  const [newRoomMembers, setNewRoomMembers] = useState("");

  useEffect(() => {
    // Fetch all rooms created by admin
    api.get(`/admin/rooms?adminId=${authUser?._id}`)
      .then(res => setRooms(res.data))
      .catch(() => setRooms([]));
  }, [authUser]);

  const handleSelectRoom = (room) => {
    setSelectedRoom(room);
    api.get(`/admin/${room._id}/members`)
      .then(res => setMembers(res.data))
      .catch(() => setMembers([]));
  };

  const handleCreateRoom = () => {
    api.post("/admin/create", {
      name: newRoomName,
      memberIds: newRoomMembers.split(",").map(id => id.trim()),
    }).then(res => {
      setRooms([...rooms, res.data]);
      setNewRoomName("");
      setNewRoomMembers("");
    });
  };

  const handleChangeNickname = (memberId) => {
    api.put(`/admin/${selectedRoom._id}/nickname`, { memberId, nickname })
      .then(res => {
        setMembers(members.map(m => m._id === memberId ? res.data : m));
        setNickname("");
      });
  };

  const handleRemoveMember = (memberId) => {
    api.delete(`/admin/${selectedRoom._id}/member/${memberId}`)
      .then(res => setMembers(res.data.members));
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-2">Admin Room Management</h2>
      <div className="mb-2 text-sm text-zinc-500">Logged in as <span className="font-semibold text-blue-600">{authUser?.fullName} ({authUser?.email})</span> <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-700 rounded">Admin</span></div>
      <div className="mb-4 text-xs text-zinc-400">You are the admin for rooms you create. Add members by their user IDs (find these in the contacts sidebar). Only admins can manage rooms and members here.</div>
      <div className="mb-6">
        <input
          type="text"
          placeholder="Room name"
          value={newRoomName}
          onChange={e => setNewRoomName(e.target.value)}
          className="input input-bordered mr-2"
        />
        <input
          type="text"
          placeholder="Member IDs (comma separated)"
          value={newRoomMembers}
          onChange={e => setNewRoomMembers(e.target.value)}
          className="input input-bordered mr-2"
        />
        <button className="btn btn-primary" onClick={handleCreateRoom}>Create Room</button>
      </div>
      <div className="flex gap-8">
        <div>
          <h3 className="font-semibold mb-2">Rooms You Admin</h3>
          <ul>
            {rooms.length === 0 && <li className="text-zinc-400">No rooms created yet.</li>}
            {rooms.map(room => (
              <li key={room._id}>
                <button className="btn btn-sm btn-outline mb-2" onClick={() => handleSelectRoom(room)}>
                  {room.name}
                </button>
              </li>
            ))}
          </ul>
        </div>
        {selectedRoom && (
          <div>
            <h3 className="font-semibold mb-2">Members in {selectedRoom.name}</h3>
            <ul>
              {members.length === 0 && <li className="text-zinc-400">No members in this room.</li>}
              {members.map(member => (
                <li key={member._id} className="mb-2 flex items-center gap-2">
                  <span>{member.fullName} ({member.email})</span>
                  <input
                    type="text"
                    placeholder="New nickname"
                    value={nickname}
                    onChange={e => setNickname(e.target.value)}
                    className="input input-xs"
                  />
                  <button className="btn btn-xs btn-info" onClick={() => handleChangeNickname(member._id)}>Change Nickname</button>
                  <button className="btn btn-xs btn-error" onClick={() => handleRemoveMember(member._id)}>Remove</button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminRoomPage;
