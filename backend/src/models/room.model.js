import mongoose from 'mongoose'

const roomSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  type: { type: String, enum: ['group', 'private'], default: 'group' },
  creator: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  avatar: { type: String, default: 'https://ui-avatars.com/api/?background=4F46E5&color=fff&name=' },
  lastMessage: { type: mongoose.Schema.Types.ObjectId, ref: 'Message' }
}, { timestamps: true });

// Generate room avatar with room name
roomSchema.pre('save', function(next) {
  if (this.isNew && this.avatar === 'https://ui-avatars.com/api/?background=4F46E5&color=fff&name=') {
    this.avatar = `https://ui-avatars.com/api/?background=4F46E5&color=fff&name=${this.name}`;
  }
  next();
});

const room = mongoose.model('Room', roomSchema);
export default room;