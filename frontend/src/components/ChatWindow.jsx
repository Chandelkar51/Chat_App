import React, { useEffect, useRef, useState } from 'react';
import { FiSend, FiPaperclip, FiImage } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { useChat } from '../context/ChatContext';
import { getSocket } from '../utils/socket';
import Message from './Messege';
import moment from 'moment';

const ChatWindow = () => {
  const { user } = useAuth();
  const { selectedRoom, messages, sendMessage, sendFile, typingUsers } = useChat();
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const fileInputRef = useRef(null);

  // Auto scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleTyping = () => {
    if (!isTyping) {
      setIsTyping(true);
      const socket = getSocket();
      socket.emit('typing:start', { roomId: selectedRoom._id });
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      const socket = getSocket();
      socket.emit('typing:stop', { roomId: selectedRoom._id });
    }, 2000);
  };

  const handleInputChange = (e) => {
    setInputMessage(e.target.value);
    handleTyping();
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    
    if (!inputMessage.trim()) return;

    sendMessage(inputMessage);
    setInputMessage('');
    setIsTyping(false);

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
  };

  const handleFileSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const result = await sendFile(file);
    
    if (!result.success) {
      alert(result.message);
    }

    e.target.value = '';
  };

  const getRoomName = () => {
    if (selectedRoom.type === 'private') {
      const otherMember = selectedRoom.members.find(m => m._id !== user._id);
      return otherMember?.username || 'Unknown User';
    }
    return selectedRoom.name;
  };

  const getRoomAvatar = () => {
    if (selectedRoom.type === 'private') {
      const otherMember = selectedRoom.members.find(m => m._id !== user._id);
      return otherMember?.avatar || selectedRoom.avatar;
    }
    return selectedRoom.avatar;
  };

  const getTypingText = () => {
    const typingUsernames = Object.values(typingUsers);
    if (typingUsernames.length === 0) return '';
    if (typingUsernames.length === 1) return `${typingUsernames[0]} is typing...`;
    return `${typingUsernames.length} people are typing...`;
  };

  if (!selectedRoom) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <div className="text-center text-gray-400">
          <FiImage size={64} className="mx-auto mb-5 opacity-50" />
          <h2 className="text-2xl font-semibold text-gray-600 mb-2">Select a chat to start messaging</h2>
          <p className="text-sm text-gray-500">Choose a room from the sidebar or create a new one</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-gray-50 h-screen">
      {/* Chat Header */}
      <div className="bg-white px-5 py-4 border-b border-gray-200 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <img 
            src={getRoomAvatar()} 
            alt={getRoomName()} 
            className="w-11 h-11 rounded-full object-cover"
          />
          <div>
            <h3 className="font-semibold text-gray-800">{getRoomName()}</h3>
            {selectedRoom.type === 'group' && (
              <span className="text-xs text-gray-500">
                {selectedRoom.members.length} members
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto px-5 py-5 space-y-4 scrollbar-thin">
        {messages.length === 0 ? (
          <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">
            <p>No messages yet. Start the conversation!</p>
          </div>
        ) : (
          <>
            {messages.map((message, index) => {
              const showDateDivider = index === 0 || 
                !moment(messages[index - 1].createdAt).isSame(message.createdAt, 'day');
              
              return (
                <React.Fragment key={message._id}>
                  {showDateDivider && (
                    <div className="relative flex items-center justify-center my-5">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-200"></div>
                      </div>
                      <span className="relative px-4 py-1 text-xs bg-gray-100 text-gray-600 rounded-full">
                        {moment(message.createdAt).calendar(null, {
                          sameDay: '[Today]',
                          lastDay: '[Yesterday]',
                          lastWeek: 'dddd',
                          sameElse: 'MMMM D, YYYY'
                        })}
                      </span>
                    </div>
                  )}
                  <Message 
                    message={message} 
                    isOwnMessage={message.sender._id === user._id}
                  />
                </React.Fragment>
              );
            })}
          </>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Typing Indicator */}
      {Object.keys(typingUsers).length > 0 && (
        <div className="px-5 py-2 bg-white border-t border-gray-200 text-xs text-gray-600 italic">
          {getTypingText()}
        </div>
      )}

      {/* Message Input */}
      <form 
        onSubmit={handleSendMessage} 
        className="bg-white px-5 py-4 border-t border-gray-200 flex items-center gap-3"
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileSelect}
          className="hidden"
          accept="image/*,.pdf,.doc,.docx,.txt"
        />
        
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          title="Attach file"
        >
          <FiPaperclip size={22} />
        </button>

        <input
          type="text"
          value={inputMessage}
          onChange={handleInputChange}
          placeholder="Type a message..."
          className="flex-1 px-4 py-2.5 border-2 border-gray-200 rounded-full focus:outline-none focus:border-primary-500 transition-colors text-sm"
        />

        <button
          type="submit"
          disabled={!inputMessage.trim()}
          className="w-10 h-10 flex items-center justify-center bg-primary-500 text-white rounded-full hover:bg-primary-600 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 transition-all"
        >
          <FiSend size={18} />
        </button>
      </form>
    </div>
  );
};

export default ChatWindow;