import React from 'react';
import ChatWindow from '../components/ChatWindow';
import Sidebar from '../components/sidebar';
import { ChatProvider } from '../context/ChatContext';

const Chat = () => {
  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <ChatProvider>
        <Sidebar />
        <ChatWindow />
      </ChatProvider>
    </div>
  );
};

export default Chat;