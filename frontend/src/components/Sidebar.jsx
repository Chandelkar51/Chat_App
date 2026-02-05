import React, { useState } from 'react';
import { FiPlus, FiMessageSquare, FiUsers, FiLogOut } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { useChat } from '../context/ChatContext';
import CreateRoomModal from './CreateRoom';
import moment from 'moment';
import { useNavigate} from 'react-router-dom'

const Sidebar = () => {
  const { user, logout } = useAuth();
  const { rooms, selectedRoom, joinRoom, onlineUsers } = useChat();
  const [showCreateRoom, setShowCreateRoom] = useState(false);
  const [filter, setFilter] = useState('all'); // all, group, private
  const Navigate=useNavigate();

  const filteredRooms = rooms.filter(room => {
    if (filter === 'all') return true;
    return room.type === filter;
  });

  const getRoomName = (room) => {
    if (room.type === 'private') {
      const otherMember = room.members.find(m => m._id !== user._id);
      return otherMember?.username || 'Unknown User';
    }
    return room.name;
  };

  const getRoomAvatar = (room) => {
    if (room.type === 'private') {
      const otherMember = room.members.find(m => m._id !== user._id);
      return otherMember?.avatar || room.avatar;
    }
    return room.avatar;
  };

  const isUserOnline = (room) => {
    if (room.type === 'private') {
      const otherMember = room.members.find(m => m._id !== user._id);
      return onlineUsers.has(otherMember?._id);
    }
    return false;
  };

  const formatLastMessage = (room) => {
    if (!room.lastMessage) return 'No messages yet';
    
    const lastMsg = room.lastMessage;
    const prefix = lastMsg.sender?._id === user._id ? 'You: ' : '';
    
    if (lastMsg.type === 'image') return prefix + '📷 Image';
    if (lastMsg.type === 'file') return prefix + '📎 File';
    
    return prefix + (lastMsg.content?.substring(0, 30) || '');
  };

  const handelLogout =()=>{
    logout();
    Navigate('/login');
  }

  return (
    <div className="w-full md:w-80 lg:w-96 bg-white border-r border-gray-200 flex flex-col h-screen">
      {/* Header */}
      <div className="p-5 border-b border-gray-200 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img 
            src={user?.avatar} 
            alt={user?.username} 
            className="w-11 h-11 rounded-full object-cover"
          />
          <div>
            <h3 className="font-semibold text-gray-800">{user?.username}</h3>
            <span className="inline-block px-2 py-0.5 text-xs bg-green-100 text-green-600 rounded-full">
              Online
            </span>
          </div>
        </div>
        <button 
          onClick={handelLogout} 
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-600 hover:text-red-500"
          title="Logout"
        >
          <FiLogOut size={20} />
        </button>
      </div>

      {/* Controls */}
      <div className="p-4 border-b border-gray-200 flex items-center gap-2">
        <div className="flex gap-2 flex-1">
          <button 
            className={`px-3 py-2 text-xs font-medium rounded-full border transition-colors ${
              filter === 'all' 
                ? 'bg-primary-500 text-white border-primary-500' 
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
            }`}
            onClick={() => setFilter('all')}
          >
            All
          </button>
          <button 
            className={`px-3 py-2 text-xs font-medium rounded-full border transition-colors flex items-center gap-1.5 ${
              filter === 'private' 
                ? 'bg-primary-500 text-white border-primary-500' 
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
            }`}
            onClick={() => setFilter('private')}
          >
            <FiMessageSquare size={14} /> Personal
          </button>
          <button 
            className={`px-3 py-2 text-xs font-medium rounded-full border transition-colors flex items-center gap-1.5 ${
              filter === 'group' 
                ? 'bg-primary-500 text-white border-primary-500' 
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
            }`}
            onClick={() => setFilter('group')}
          >
            <FiUsers size={14} /> Groups
          </button>
        </div>
        
        <button 
          className="w-9 h-9 flex items-center justify-center bg-primary-500 text-white rounded-full hover:bg-primary-600 hover:scale-105 active:scale-95 transition-all shadow-md"
          onClick={() => setShowCreateRoom(true)}
          title="Create New Room"
        >
          <FiPlus size={20} />
        </button>
      </div>

      {/* Rooms List */}
      <div className="flex-1 overflow-y-auto scrollbar-thin">
        {filteredRooms.length === 0 ? (
          <div className="p-10 text-center text-gray-500">
            <p className="mb-4">No {filter !== 'all' ? filter : ''} rooms yet</p>
            <button 
              onClick={() => setShowCreateRoom(true)}
              className="px-4 py-2 bg-primary-500 text-white text-sm rounded-lg hover:bg-primary-600 transition-colors"
            >
              Create One
            </button>
          </div>
        ) : (
          filteredRooms.map(room => (
            <div
              key={room._id}
              className={`p-4 flex gap-3 cursor-pointer transition-colors border-b border-gray-100 hover:bg-gray-50 ${
                selectedRoom?._id === room._id ? 'bg-blue-50 border-l-4 border-primary-500' : ''
              }`}
              onClick={() => joinRoom(room)}
            >
              <div className="relative flex-shrink-0">
                <img 
                  src={getRoomAvatar(room)} 
                  alt={getRoomName(room)} 
                  className="w-12 h-12 rounded-full object-cover"
                />
                {isUserOnline(room) && (
                  <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full"></span>
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center mb-1">
                  <h4 className="font-semibold text-gray-800 text-sm truncate">
                    {getRoomName(room)}
                  </h4>
                  {room.lastMessage && (
                    <span className="text-xs text-gray-500 flex-shrink-0">
                      {moment(room.updatedAt).fromNow(true)}
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-600 truncate">
                  {formatLastMessage(room)}
                </p>
              </div>
            </div>
          ))
        )}
      </div>

      {showCreateRoom && (
        <CreateRoomModal onClose={() => setShowCreateRoom(false)} />
      )}
    </div>
  );
};

export default Sidebar;