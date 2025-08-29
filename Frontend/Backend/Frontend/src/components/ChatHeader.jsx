import React from "react";
import { useChatStore } from "../store/useChatStore";
import { LogOut } from "lucide-react";

const ChatHeader = () => {
	const { selectedUser, setSelectedUser } = useChatStore();

	const handleDeselectUser = () => {
		// In this context, this means "go back" or "deselect user"
		setSelectedUser(null);
	};

	if (!selectedUser) return null;

	return (
		<div className='bg-base-300 px-4 py-2 flex justify-between items-center'>
			<div className='flex items-center gap-2'>
				<div className='avatar'>
					<div className='w-10 rounded-full'>
						<img src={selectedUser.profilePic} alt={`${selectedUser.fullName}'s avatar`} />
					</div>
				</div>
				<span className='text-lg font-bold'>{selectedUser.fullName}</span>
			</div>
			<button onClick={handleDeselectUser} className='btn btn-ghost btn-circle' title='Close Chat'>
				<LogOut className='w-6 h-6' />
			</button>
		</div>
	);
};

export default ChatHeader;

