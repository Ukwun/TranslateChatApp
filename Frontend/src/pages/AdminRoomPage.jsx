import React, { useEffect, useState } from "react";
import api from "../api/api";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";
import ChatBox from "../components/ChatBox";

const AdminRoomPage = () => {
  const { authUser, onlineUsers } = useAuthStore();
  const { users, getUsers } = useChatStore();
  const [rooms, setRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [members, setMembers] = useState([]);
  const [nickname, setNickname] = useState("");
  const [newRoomName, setNewRoomName] = useState("");
  const [invitedUserIds, setInvitedUserIds] = useState([]);

  useEffect(() => {
    api.get(`/admin/rooms?adminId=${authUser?._id}`)
      .then(res => setRooms(res.data))
      .catch(() => setRooms([]));
    getUsers();
  }, [authUser, getUsers]);

  const handleSelectRoom = (room) => {
    setSelectedRoom(room);
    api.get(`/admin/${room._id}/members`)
      .then(res => setMembers(res.data))
      .catch(() => setMembers([]));
  };

  const handleCreateRoom = () => {
    api.post("/admin/create", {
      name: newRoomName,
      memberIds: invitedUserIds,
    }).then(res => {
      setRooms([...rooms, res.data]);
      setSelectedRoom(res.data); // Show chat UI for new room
      setNewRoomName("");
      setInvitedUserIds([]);
    });
  };

  const handleInviteOnlineUser = (userId) => {
    setInvitedUserIds(prev => prev.includes(userId) ? prev : [...prev, userId]);
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
    <div className="min-h-screen flex flex-col items-center justify-start bg-gradient-to-b from-blue-900 to-gray-900 py-10 px-4">
      <div className="w-full max-w-3xl bg-white/95 rounded-3xl shadow-2xl p-10 mb-10">
        <h2 className="text-3xl font-extrabold text-blue-700 mb-4 tracking-tight">Admin Room Management</h2>
        <div className="mb-4 text-lg text-gray-700 flex items-center gap-2">
          <span>Logged in as</span>
          <span className="font-bold text-blue-600">{authUser?.fullName}</span>
          <span className="text-gray-500">({authUser?.email})</span>
          <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">Admin</span>
        </div>
        <div className="mb-8 text-base text-gray-500">You are the admin for rooms you create. Invite online users below before creating your room. Only admins can manage rooms and members here.<br /><span className="text-blue-600 font-semibold">Online users are shown below. Click 'Invite' to add them to your new room before creating it.</span></div>

        {/* Online Users List for Inviting (always visible) */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-blue-700 mb-2">Online Users</h3>
          <div className="flex flex-wrap gap-4">
            {users.filter(u => onlineUsers.includes(u._id) && u._id !== authUser._id).length === 0 && (
              <span className="text-gray-400">No other users online.</span>
            )}
            {users.filter(u => onlineUsers.includes(u._id) && u._id !== authUser._id).map(user => (
              <div key={user._id} className="flex items-center gap-2 bg-blue-50 rounded-xl px-4 py-2 shadow">
                <img src={user.profilePic || "/avatar-placeholder.png"} alt={user.fullName} className="w-8 h-8 rounded-full object-cover" />
                <span className="font-medium text-blue-800">{user.fullName}</span>
                <button className={`btn btn-xs ${invitedUserIds.includes(user._id) ? 'bg-green-600' : 'bg-blue-600'} text-white rounded px-3 py-1 font-semibold hover:bg-blue-700`} onClick={() => handleInviteOnlineUser(user._id)}>
                  {invitedUserIds.includes(user._id) ? 'Invited' : 'Invite'}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Room Creation Section */}
        <div className="flex flex-col md:flex-row gap-6 mb-10 items-center">
          <input
            type="text"
            placeholder="Room name"
            value={newRoomName}
            onChange={e => setNewRoomName(e.target.value)}
            className="flex-1 px-5 py-3 rounded-xl border border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-800 bg-white shadow-lg text-lg"
          />
          <button className="px-8 py-3 rounded-xl bg-blue-700 text-white font-bold shadow-lg hover:bg-blue-800 transition text-lg" onClick={handleCreateRoom}>Create Room</button>
        </div>

        <div className="flex flex-col md:flex-row gap-10">
          <div className="flex-1">
            <h3 className="font-semibold text-xl text-blue-700 mb-4">Rooms You Admin</h3>
            <ul className="space-y-3">
              {rooms.length === 0 && <li className="text-gray-400">No rooms created yet.</li>}
              {rooms.map(room => (
                <li key={room._id}>
                  <button className="w-full text-left px-5 py-3 rounded-xl bg-blue-100 text-blue-800 font-semibold shadow-lg hover:bg-blue-200 transition text-lg" onClick={() => handleSelectRoom(room)}>
                    {room.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>
          {selectedRoom && (
            <div className="flex-1">
              <h3 className="font-semibold text-xl text-blue-700 mb-4">Members in {selectedRoom.name}</h3>
              <ul className="space-y-3">
                {members.length === 0 && <li className="text-gray-400">No members in this room.</li>}
                {members.map(member => (
                  <li key={member._id} className="flex items-center gap-4 bg-gray-100 rounded-xl px-5 py-3 shadow-lg">
                    <img src={member.profilePic || "/avatar-placeholder.png"} alt={member.fullName} className="w-8 h-8 rounded-full object-cover" />
                    <span className="font-semibold text-gray-800">{member.fullName} <span className="text-xs text-gray-500">({member.email})</span></span>
                    <input
                      type="text"
                      placeholder="New nickname"
                      value={nickname}
                      onChange={e => setNickname(e.target.value)}
                      className="input input-xs px-3 py-2 rounded-xl border border-blue-300 focus:outline-none focus:ring-1 focus:ring-blue-400 text-gray-700 text-base"
                    />
                    <button className="btn btn-xs bg-blue-600 text-white rounded px-4 py-2 font-semibold hover:bg-blue-700" onClick={() => handleChangeNickname(member._id)}>Change Nickname</button>
                    <button className="btn btn-xs bg-red-600 text-white rounded px-4 py-2 font-semibold hover:bg-red-700" onClick={() => handleRemoveMember(member._id)}>Remove</button>
                  </li>
                ))}
              </ul>
              {/* Real chat box for the room */}
              <div className="mt-8 p-6 rounded-xl bg-gray-50 shadow-lg">
                <h4 className="font-bold text-blue-700 mb-2">Chat Room: {selectedRoom.name}</h4>
                <div className="border rounded-lg p-0 bg-white min-h-[120px] text-gray-700">
                  <ChatBox
                    user={authUser}
                    currentChatUser={null} // will be handled in ChatBox for room
                    room={selectedRoom}
                    members={members}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminRoomPage;
