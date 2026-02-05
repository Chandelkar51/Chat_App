import Room from '../models/room.model.js'
import Message from '../models/message.model.js'

export const createRoom= async (req, res) => {
  try {
    const { name, description, type, members } = req.body;

    if (type === 'private' && members.length !== 2) {
      return res.status(400).json({ message: 'Private rooms must have exactly 2 members' });
    }

    if (type === 'private') {
      const existingRoom = await Room.findOne({
        type: 'private',
        members: { $all: members }
      });

      if (existingRoom) {
        return res.status(200).json(existingRoom);
      }
    }

    const room = await Room.create({
      name,
      description,
      type,
      creator: req.user._id,
      members: type === 'private' ? members : [req.user._id, ...members]
    });

    const populatedRoom = await Room.findById(room._id)
      .populate('members', '-password')
      .populate('creator', '-password');

    res.status(201).json(populatedRoom);
  }
  catch (error) {
    console.error('Create room error:', error);
    res.status(500).json({ message: 'Server error' });
  }
}

export const getRooms= async (req, res) => {
  try {
    const rooms = await Room.find({
      members: req.user._id
    })
      .populate('members', '-password')
      .populate('creator', '-password')
      .populate({
        path: 'lastMessage',
        populate: {
          path: 'sender',
          select: 'username avatar'
        }
      })
      .sort({ updatedAt: -1 });

    res.json(rooms);
  }
  catch (error) {
    console.error('Get rooms error:', error);
    res.status(500).json({ message: 'Server error' });
  }
}

export const getRoom= async (req, res) => {
  try {
    const room = await Room.findById(req.params.id)
      .populate('members', '-password')
      .populate('creator', '-password');

    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    if (!room.members.some(member => member._id.toString() === req.user._id.toString())) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(room);
  }
  catch (error) {
    console.error('Get room error:', error);
    res.status(500).json({ message: 'Server error' });
  }
}

export const updateRoom= async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);

    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    if (room.creator.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only creator can update room' });
    }

    const { name, description, members } = req.body;
    
    if (name) room.name = name;
    if (description) room.description = description;
    if (members) room.members = members;

    await room.save();

    const updatedRoom = await Room.findById(room._id)
      .populate('members', '-password')
      .populate('creator', '-password');

    res.json(updatedRoom);
  }
  catch (error) {
    console.error('Update room error:', error);
    res.status(500).json({ message: 'Server error' });
  }
}

export const deleteRoom= async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);

    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    if (room.creator.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only creator can delete room' });
    }

    await Message.deleteMany({ room: req.params.id });

    await Room.findByIdAndDelete(req.params.id);

    res.json({ message: 'Room deleted successfully' });
  }
  catch (error) {
    console.error('Delete room error:', error);
    res.status(500).json({ message: 'Server error' });
  }
}
