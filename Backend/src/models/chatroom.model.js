import mongoose from "mongoose";

const chatRoomSchema = new mongoose.Schema({
  name: { type: String, required: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  isActive: { type: Boolean, default: true },
});

const ChatRoom = mongoose.model("ChatRoom", chatRoomSchema);
export default ChatRoom;
