import Message from '../models/message.model.js'
import Room from '../models/room.model.js'

export const sendMsg= async (req, res) => {
  try {
    const { roomId, content, type } = req.body;

    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    if (!room.members.includes(req.user._id)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const message = await Message.create({
      room: roomId,
      sender: req.user._id,
      content,
      type: type || 'text'
    });

    room.lastMessage = message._id;
    await room.save();

    const populatedMessage = await Message.findById(message._id)
      .populate('sender', 'username avatar');

    res.status(201).json(populatedMessage);
  }
  catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ message: 'Server error' });
  }
}

export const uploadAndSend= async (req, res) => {
  try {
    const { roomId } = req.body;
    
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    if (!room.members.includes(req.user._id)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const fileType = req.file.mimetype.startsWith('image/') ? 'image' : 'file';

    const message = await Message.create({
      room: roomId,
      sender: req.user._id,
      content: req.file.originalname,
      type: fileType,
      fileUrl: `/uploads/${req.file.filename}`,
      fileName: req.file.originalname,
      fileSize: req.file.size
    });

    room.lastMessage = message._id;
    await room.save();

    const populatedMessage = await Message.findById(message._id)
      .populate('sender', 'username avatar');

    res.status(201).json(populatedMessage);
  }
  catch (error) {
    console.error('Upload file error:', error);
    res.status(500).json({ message: 'Server error' });
  }
}

export const getRoomMessage= async (req, res) => {
  try {
    const { roomId } = req.params;
    const limit = parseInt(req.query.limit) || 50;
    const page = parseInt(req.query.page) || 1;

    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    if (!room.members.includes(req.user._id)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const messages = await Message.find({ room: roomId, deleted: false })
      .populate('sender', 'username avatar')
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip((page - 1) * limit);

    const total = await Message.countDocuments({ room: roomId, deleted: false });

    res.json({
      messages: messages.reverse(),
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalMessages: total
    });
  }
  catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ message: 'Server error' });
  }
}

export const deleteMsg= async (req, res) => {
  try {
    const message = await Message.findById(req.params.id);

    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    if (message.sender.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only sender can delete message' });
    }

    message.deleted = true;
    message.content = 'This message was deleted';
    await message.save();

    res.json({ message: 'Message deleted successfully' });
  }
  catch (error) {
    console.error('Delete message error:', error);
    res.status(500).json({ message: 'Server error' });
  }
}
