import React, { useEffect, useRef } from "react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import ChatHeader from "./ChatHeader";
import MessageSkeleton from "./skeletons/MessageSkeleton";
import MessageInput from "./MessageInputComponent.jsx";

const ChatContainer = () => {
	const { messages, isMessagesLoading, getMessages, selectedUser } = useChatStore();
	const { authUser } = useAuthStore();
	const messageContainerRef = useRef(null);

	useEffect(() => {
		if (selectedUser?._id) {
			getMessages(selectedUser._id);
		}
	}, [selectedUser, getMessages]);

	useEffect(() => {
		// Scroll to the bottom on new messages
		if (messageContainerRef.current) {
			messageContainerRef.current.scrollTop = messageContainerRef.current.scrollHeight;
		}
	}, [messages]);

	return (
		<div className='flex flex-col w-full h-full'>
			<ChatHeader />

			<div ref={messageContainerRef} className='flex-1 overflow-y-auto p-4 bg-base-100'>
				{isMessagesLoading && (
					<div className='flex flex-col gap-4'>
						<MessageSkeleton />
						<MessageSkeleton />
						<MessageSkeleton />
					</div>
				)}

				{!isMessagesLoading &&
					messages.map((msg) => {
						const isSender = msg.sender._id === authUser._id;
						const chatClassName = isSender ? "chat-end" : "chat-start";
						const bubbleClassName = isSender ? "chat-bubble-primary" : "";

						return (
							<div key={msg._id} className={`chat ${chatClassName}`}>
								<div className='chat-image avatar'>
									<div className='w-10 rounded-full'>
										<img alt='User avatar' src={msg.sender.profilePic} />
									</div>
								</div>
								<div className={`chat-bubble ${bubbleClassName}`}>{msg.content}</div>
							</div>
						);
					})}
			</div>

			<MessageInput />
		</div>
	);
};

export default ChatContainer;