import React from 'react'
import { useChatStore } from '../store/useChatStore'
import { useAuthStore } from '../store/useAuthStore.js'
import Sidebar from '../components/Sidebar'
import NoChatSelected from '../components/NoChatSelected'
import ChatBox from '../components/ChatBox.jsx'

const ChatHomePage = () => {
    const { selectedUser } = useChatStore()
    const { authUser } = useAuthStore()

  return (
    <div className="h-screen bg-base-200">
        <div className="flex items-center justify-center pt-20 px-4">
            <div className="bg-base-100 rounded-lg shadow-cl w-full max-w-6xl h-[calc(100vh-8rem)]">
                <div className="flex h-full rounded-lg overflow-hidden">
                    <Sidebar />

                    {!selectedUser ? <NoChatSelected /> : <ChatBox user={authUser} currentChatUser={selectedUser} />}

                </div>

            </div>

        </div>

    </div>
  )
}

export default ChatHomePage