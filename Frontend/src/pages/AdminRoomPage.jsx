import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";
import ChatBox from "../components/ChatBox";

const AdminRoomPage = () => {
  const { authUser, onlineUsers, checkAuth, isCheckingAuth } = useAuthStore();
  // Placeholder handlers to prevent blank page
  const handleChangeNickname = (memberId) => {
    // TODO: Implement nickname change logic
    alert("Change nickname feature coming soon!");
  };

  const handleRemoveMember = (memberId) => {
    // TODO: Implement remove member logic
    alert("Remove member feature coming soon!");
  };
  const navigate = useNavigate();
  const { users, getUsers } = useChatStore();
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [members, setMembers] = useState([]);
  const [nickname, setNickname] = useState("");
  const [newRoomName, setNewRoomName] = useState("");
  const [invitedUserIds, setInvitedUserIds] = useState([]);

  useEffect(() => {
    checkAuth();
    console.log("authUser:", authUser);
  }, [checkAuth, authUser]);

  useEffect(() => {
    if (!isCheckingAuth && (!authUser || !authUser._id)) {
      setError("Authentication failed. Please log in again.");
      // navigate("/login");
    }
  }, [isCheckingAuth, authUser, navigate]);

  useEffect(() => {
    if (!authUser?._id) return;
    setLoading(true);
    api.get(`/admin/rooms?adminId=${authUser._id}`)
      .then(res => {
        console.log("Rooms response:", res.data);
        setRooms(res.data);
        setError("");
        setLoading(false);
      })
      .catch((err) => {
        console.error("Rooms fetch error:", err);
        setRooms([]);
        setError("Failed to load admin rooms. Please check your login or server status.");
        setLoading(false);
      });
    getUsers();
  }, [authUser, getUsers]);

  // Fetch members when a room is selected
  useEffect(() => {
    if (!selectedRoom) {
      setMembers([]);
      return;
    }
    api.get(`/admin/rooms/${selectedRoom._id}/members`)
      .then(res => {
        setMembers(res.data);
        setError("");
      })
      .catch(() => {
        setMembers([]);
        setError("Failed to load room members. Please try again.");
      });
  }, [selectedRoom]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-start bg-gradient-to-b from-blue-900 to-gray-900 py-10 px-4">
      <div className="w-full max-w-3xl bg-white/95 rounded-3xl shadow-2xl p-10 mb-10">
        <h2 className="text-3xl font-extrabold text-blue-700 mb-4 tracking-tight">Admin Room Management</h2>
        {error && (
          <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-xl text-center font-semibold">
            {error}
          </div>
        )}

        {/* Create Room UI restored */}
        <div className="flex items-center gap-4 mb-8">
          <input
            type="text"
            placeholder="Enter room name..."
            value={newRoomName}
            onChange={e => setNewRoomName(e.target.value)}
            className="input input-lg px-5 py-3 rounded-xl border border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-700 text-xl w-full"
          />
          <button
            className="btn bg-blue-700 text-white rounded-xl px-6 py-3 font-bold text-xl hover:bg-blue-800 transition"
            onClick={async () => {
              if (!newRoomName.trim()) return;
              try {
                const res = await api.post("/admin/rooms", {
                  name: newRoomName,
                  adminId: authUser._id,
                  invitedUserIds: [],
                });
                setRooms([res.data, ...rooms]);
                setNewRoomName("");
                setError("");
              } catch (err) {
                setError("Failed to create room. Please try again.");
              }
            }}
          >Create Room</button>
        </div>

        {loading ? (
          <div className="text-center text-blue-600 font-bold text-xl py-10">Loading rooms...</div>
        ) : rooms.length === 0 ? (
          <div className="text-center text-gray-400 font-semibold text-lg py-10">No rooms found. Create a room above to get started.</div>
        ) : (
          <div className="flex flex-col md:flex-row gap-10">
            <div className="flex-1">
              <h3 className="font-semibold text-xl text-blue-700 mb-4">Rooms You Admin</h3>
              <ul className="space-y-3">
                {rooms.map(room => (
                  <li key={room._id}>
                    <button className="w-full text-left px-5 py-3 rounded-xl bg-blue-100 text-blue-800 font-semibold shadow-lg hover:bg-blue-200 transition text-lg" onClick={() => setSelectedRoom(room)}>
                      {room.name}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
            {selectedRoom ? (
              <div className="flex-1">
                <h3 className="font-semibold text-xl text-blue-700 mb-4">Members in {selectedRoom.name}</h3>
                <ul className="space-y-3">
                  {members.length === 0 && <li className="text-gray-400">No members in this room yet. Invite users to join.</li>}
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
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-400 text-lg">
                Select a room to view members and chat.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminRoomPage;
