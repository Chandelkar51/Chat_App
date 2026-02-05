import mongoose from 'mongoose'

const messageSchema = new mongoose.Schema({
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  room: { type: mongoose.Schema.Types.ObjectId, ref: 'Room', required: true },
  content: { type: String, required: function() {
      return !this.fileUrl; 
    }
  },
  type: { type: String, enum: ['text', 'image', 'file'], default: 'text' },
  fileUrl: { type: String, default: null },
  fileName: { type: String, default: null },
  readBy: [{ 
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    readAt: { type: Date, default: Date.now }
  }],
  deleted: { type: Boolean, default: false }
}, { timestamps: true });

// Index for faster queries
messageSchema.index({ room: 1, createdAt: -1 });

const message = mongoose.model('Message', messageSchema);
export default message;