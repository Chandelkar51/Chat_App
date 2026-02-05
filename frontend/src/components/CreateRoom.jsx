import React, { useState } from 'react';
import { FiX } from 'react-icons/fi';
import { useChat } from '../context/ChatContext';
import { useAuth } from '../context/AuthContext';

const CreateRoomModal = ({ onClose }) => {
  const { user } = useAuth();
  const { createRoom, users } = useChat();
  const [roomType, setRoomType] = useState('group');
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const toggleUserSelection = (userId) => {
    setSelectedUsers(prev => 
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (roomType === 'private' && selectedUsers.length !== 1) {
      setError('Please select exactly one user for private chat');
      setLoading(false);
      return;
    }

    if (roomType === 'group' && !formData.name.trim()) {
      setError('Please enter a room name');
      setLoading(false);
      return;
    }

    const roomData = {
      type: roomType,
      name: roomType === 'private' 
        ? 'Private Chat' 
        : formData.name,
      description: formData.description,
      members: roomType === 'private' 
        ? [user._id, ...selectedUsers]
        : selectedUsers
    };

    const result = await createRoom(roomData);

    if (result.success) {
      onClose();
    } else {
      setError(result.message);
    }

    setLoading(false);
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fade-in"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 pb-4 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white z-10">
          <h2 className="text-xl font-bold text-gray-800">
            Create New {roomType === 'private' ? 'Private Chat' : 'Group'}
          </h2>
          <button 
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-lg transition-colors text-gray-600"
          >
            <FiX size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-3 rounded text-sm">
              {error}
            </div>
          )}

          {/* Room Type */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">Room Type</label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  value="group"
                  checked={roomType === 'group'}
                  onChange={(e) => setRoomType(e.target.value)}
                  className="w-4 h-4 text-primary-500 focus:ring-primary-500"
                />
                <span className="text-sm text-gray-700">Group Chat</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  value="private"
                  checked={roomType === 'private'}
                  onChange={(e) => setRoomType(e.target.value)}
                  className="w-4 h-4 text-primary-500 focus:ring-primary-500"
                />
                <span className="text-sm text-gray-700">Private Chat</span>
              </label>
            </div>
          </div>

          {/* Group Name & Description */}
          {roomType === 'group' && (
            <>
              <div className="space-y-2">
                <label htmlFor="name" className="block text-sm font-semibold text-gray-700">
                  Room Name *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter room name"
                  required={roomType === 'group'}
                  className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100 transition-all text-sm"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="description" className="block text-sm font-semibold text-gray-700">
                  Description (Optional)
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Enter room description"
                  rows="3"
                  className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100 transition-all text-sm resize-none"
                />
              </div>
            </>
          )}

          {/* User Selection */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">
              {roomType === 'private' ? 'Select User' : 'Add Members (Optional)'}
            </label>
            <div className="max-h-60 overflow-y-auto border-2 border-gray-200 rounded-lg p-2 space-y-1">
              {users.map(u => (
                <label 
                  key={u._id} 
                  className="flex items-center gap-3 p-2.5 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors"
                >
                  <input
                    type={roomType === 'private' ? 'radio' : 'checkbox'}
                    checked={selectedUsers.includes(u._id)}
                    onChange={() => toggleUserSelection(u._id)}
                    className="w-4 h-4 text-primary-500 focus:ring-primary-500"
                  />
                  <img 
                    src={u.avatar} 
                    alt={u.username} 
                    className="w-8 h-8 rounded-full object-cover"
                  />
                  <span className="text-sm text-gray-700">{u.username}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <button 
              type="button" 
              onClick={onClose}
              className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors text-sm"
            >
              Cancel
            </button>
            <button 
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2.5 bg-primary-500 text-white font-medium rounded-lg hover:bg-primary-600 disabled:opacity-60 disabled:cursor-not-allowed transition-colors text-sm"
            >
              {loading ? 'Creating...' : 'Create Room'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateRoomModal;