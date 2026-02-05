import jwt from 'jsonwebtoken'
import User from '../src/models/user.model.js'
import Message from '../src/models/message.model.js'
import Room from '../src/models/room.model.js'

const activeUsers = new Map();

const initializeSocket = (io) => {
  // Socket.IO authentication middleware
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      
      if (!token) {
        return next(new Error('Authentication error'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select('-password');
      
      if (!user) {
        return next(new Error('User not found'));
      }

      socket.userId = user._id.toString();
      socket.username = user.username;
      next();
    } 
    catch (error) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', async (socket) => {
    console.log(`User connected: ${socket.username} (${socket.userId})`);

    // Add user to active users
    activeUsers.set(socket.userId, socket.id);

    await User.findByIdAndUpdate(socket.userId, { 
      status: 'online',
      lastSeen: Date.now()
    });

    // Broadcast user online status
    io.emit('user:status', { 
      userId: socket.userId, 
      status: 'online' 
    });

    // Join user's rooms
    socket.on('room:join', async (roomId) => {
      try {
        const room = await Room.findById(roomId);
        
        if (room && room.members.includes(socket.userId)) {
          socket.join(roomId);
          console.log(`${socket.username} joined room: ${roomId}`);
          
          socket.to(roomId).emit('user:joined', {
            userId: socket.userId,
            username: socket.username,
            roomId
          });
        }
      } catch (error) {
        console.error('Room join error:', error);
      }
    });

    // Leave room
    socket.on('room:leave', (roomId) => {
      socket.leave(roomId);
      console.log(`${socket.username} left room: ${roomId}`);
      
      socket.to(roomId).emit('user:left', {
        userId: socket.userId,
        username: socket.username,
        roomId
      });
    });

    // Handle new message
    socket.on('message:send', async (data) => {
      try {
        const { roomId, content, type } = data;

        // Verify user is member of room
        const room = await Room.findById(roomId);
        if (!room || !room.members.includes(socket.userId)) {
          return socket.emit('error', { message: 'Access denied' });
        }

        // Create message
        const message = await Message.create({
          room: roomId,
          sender: socket.userId,
          content,
          type: type || 'text'
        });

        room.lastMessage = message._id;
        room.updatedAt = Date.now();
        await room.save();

        const populatedMessage = await Message.findById(message._id)
          .populate('sender', 'username avatar');

        // Emit to all users in the room
        io.to(roomId).emit('message:received', {
          message: populatedMessage,
          roomId
        });

        // Update room for all members
        const updatedRoom = await Room.findById(roomId)
          .populate('members', '-password')
          .populate('lastMessage');

        room.members.forEach(memberId => {
          const socketId = activeUsers.get(memberId.toString());
          if (socketId) {
            io.to(socketId).emit('room:updated', updatedRoom);
          }
        });

      }
      catch (error) {
        console.error('Message send error:', error);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // Handle typing indicator
    socket.on('typing:start', (data) => {
      const { roomId } = data;
      socket.to(roomId).emit('user:typing', {
        userId: socket.userId,
        username: socket.username,
        roomId
      });
    });

    socket.on('typing:stop', (data) => {
      const { roomId } = data;
      socket.to(roomId).emit('user:stopped-typing', {
        userId: socket.userId,
        roomId
      });
    });

    // Handle message read
    socket.on('message:read', async (data) => {
      try {
        const { messageId, roomId } = data;
        
        const message = await Message.findById(messageId);
        if (message) {
          // Add user to readBy array if not already present
          const alreadyRead = message.readBy.some(
            read => read.user.toString() === socket.userId
          );
          
          if (!alreadyRead) {
            message.readBy.push({
              user: socket.userId,
              readAt: Date.now()
            });
            await message.save();
          }

          // Notify other users in room
          socket.to(roomId).emit('message:read-update', {
            messageId,
            userId: socket.userId,
            roomId
          });
        }
      } catch (error) {
        console.error('Message read error:', error);
      }
    });

    // Handle disconnect
    socket.on('disconnect', async () => {
      console.log(`User disconnected: ${socket.username}`);
      
      activeUsers.delete(socket.userId);

      await User.findByIdAndUpdate(socket.userId, { 
        status: 'offline',
        lastSeen: Date.now()
      });

      // Broadcast user offline status
      io.emit('user:status', { 
        userId: socket.userId, 
        status: 'offline' 
      });
    });
  });

  return io;
};

export default initializeSocket;