import { createContext, useState, useContext, useEffect, useCallback } from 'react';
import api from '../utils/api';
import { getSocket } from '../utils/socket';
import { useAuth } from './AuthContext';

const ChatContext = createContext();

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};

export const ChatProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [rooms, setRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const [typingUsers, setTypingUsers] = useState({});
  const [onlineUsers, setOnlineUsers] = useState(new Set());
  const [loading, setLoading] = useState(false);

  // Fetch all rooms
  const fetchRooms = useCallback(async () => {
    if (!isAuthenticated) return;
    
    try {
      setLoading(true);
      const response = await api.get('/rooms');
      setRooms(response.data);
    } catch (error) {
      console.error('Fetch rooms error:', error);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  // Fetch messages for a room
  const fetchMessages = useCallback(async (roomId) => {
    try {
      setLoading(true);
      const response = await api.get(`/messages/${roomId}`);
      setMessages(response.data.messages);
    } catch (error) {
      console.error('Fetch messages error:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch all users
  const fetchUsers = useCallback(async () => {
    if (!isAuthenticated) return;
    
    try {
      const response = await api.get('/auth/users');
      setUsers(response.data);
    } catch (error) {
      console.error('Fetch users error:', error);
    }
  }, [isAuthenticated]);

  // Create new room
  const createRoom = async (roomData) => {
    try {
      const response = await api.post('/rooms', roomData);
      setRooms(prev => [response.data, ...prev]);
      return { success: true, room: response.data };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to create room'
      };
    }
  };

  // Send message via Socket.IO
  const sendMessage = (content, type = 'text') => {
    if (!selectedRoom) return;
    
    const socket = getSocket();
    socket.emit('message:send', {
      roomId: selectedRoom._id,
      content,
      type
    });
  };

  // Upload and send file
  const sendFile = async (file) => {
    if (!selectedRoom) return;

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('roomId', selectedRoom._id);

      const response = await api.post('/messages/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
console.log(response)
      return { success: true, message: response.data };
    } 
    catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to upload file'
      };
    }
  };

  // Join room
  const joinRoom = (room) => {
    if (selectedRoom?._id === room._id) return;

    // Leave previous room
    if (selectedRoom) {
      const socket = getSocket();
      socket.emit('room:leave', selectedRoom._id);
    }

    setSelectedRoom(room);
    setMessages([]);
    fetchMessages(room._id);

    const socket = getSocket();
    socket.emit('room:join', room._id);
  };

  // Setup Socket.IO listeners
  useEffect(() => {
    if (!isAuthenticated) return;

    try {
      const socket = getSocket();

      // Handle incoming messages
      socket.on('message:received', ({ message, roomId }) => {
        setMessages(prev => [...prev, message]);
        
        // Update room's last message
        setRooms(prev => prev.map(room => 
          room._id === roomId 
            ? { ...room, lastMessage: message, updatedAt: new Date() }
            : room
        ));
      });

      // Handle room updates
      socket.on('room:updated', (updatedRoom) => {
        setRooms(prev => {
          const exists = prev.find(r => r._id === updatedRoom._id);
          if (exists) {
            return prev.map(r => r._id === updatedRoom._id ? updatedRoom : r);
          } else {
            return [updatedRoom, ...prev];
          }
        });
      });

      // Handle user status changes
      socket.on('user:status', ({ userId, status }) => {
        setOnlineUsers(prev => {
          const newSet = new Set(prev);
          if (status === 'online') {
            newSet.add(userId);
          } else {
            newSet.delete(userId);
          }
          return newSet;
        });
      });

      // Handle typing indicators
      socket.on('user:typing', ({ userId, username, roomId }) => {
        if (selectedRoom?._id === roomId) {
          setTypingUsers(prev => ({ ...prev, [userId]: username }));
        }
      });

      socket.on('user:stopped-typing', ({ userId, roomId }) => {
        if (selectedRoom?._id === roomId) {
          setTypingUsers(prev => {
            const newTyping = { ...prev };
            delete newTyping[userId];
            return newTyping;
          });
        }
      });

      return () => {
        socket.off('message:received');
        socket.off('room:updated');
        socket.off('user:status');
        socket.off('user:typing');
        socket.off('user:stopped-typing');
      };
    }
    catch (error) {
      console.error('Socket listener error:', error);
    }
  }, [isAuthenticated, selectedRoom]);

  // Fetch initial data
  useEffect(() => {
    if (isAuthenticated) {
      fetchRooms();
      fetchUsers();
    }
  }, [isAuthenticated, fetchRooms, fetchUsers]);

  const value = {
    rooms,
    selectedRoom,
    messages,
    users,
    typingUsers,
    onlineUsers,
    loading,
    fetchRooms,
    fetchMessages,
    fetchUsers,
    createRoom,
    sendMessage,
    sendFile,
    joinRoom,
    setSelectedRoom
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};

export default ChatContext;