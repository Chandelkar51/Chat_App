import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'

const userSchema = new mongoose.Schema({
  username: { type: String, required: [true, 'Username is required'], unique: true, trim: true, minlength: [3] },
  email: { type: String, required: [true, 'Email is required'], unique: true, lowercase: true, trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email']
  },
  password: { type: String, required: [true, 'Password is required'], minlength: [4] },
  avatar: { type: String, default: 'https://ui-avatars.com/api/?background=random&name=' },
  status: { type: String, enum: ['online', 'offline', 'away'], default: 'offline' },
  lastSeen: { type: Date, default: Date.now }
}, { timestamps: true });

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  } 
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Generate avatar URL with username
userSchema.pre('save', function(next) {
  if (this.isNew && this.avatar === 'https://ui-avatars.com/api/?background=random&name=') {
    this.avatar = `https://ui-avatars.com/api/?background=random&name=${this.username}`;
  }
  next();
});

const user = mongoose.model('User', userSchema);
export default user;