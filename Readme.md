# Real-Time Chat Application with WebSockets

A full-stack real-time chat application built with the MERN stack (MongoDB, Express.js, React, Node.js) featuring WebSocket-based real-time communication, authentication, and file sharing capabilities.

## 🚀 Features

### Core Features
- ✅ **Real-time messaging** - Instant message delivery using Socket.IO
- ✅ **User Authentication** - Secure JWT-based authentication
- ✅ **Multiple Chat Rooms** - Create and join group chats
- ✅ **Private Conversations** - One-on-one messaging
- ✅ **File Sharing** - Upload and share images and files
- ✅ **Message Persistence** - All messages saved to MongoDB
- ✅ **Typing Indicators** - See when others are typing
- ✅ **Online Status** - Real-time user presence tracking

## 📋 Tech Stack

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling
- **Socket.IO** - Real-time bidirectional communication
- **JWT** - Authentication tokens
- **Bcrypt** - Password hashing
- **Multer** - File upload handling

### Frontend
- **React** - UI library
- **React Router** - Client-side routing
- **Socket.IO Client** - WebSocket client
- **Axios** - HTTP client
- **Moment.js** - Date/time formatting
- **React Icons** - Icon library

## 🔧 Installation & Setup

```

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or cloud instance)
- npm 

### Backend Setup

1. **Navigate to backend directory**
```bash
cd backend
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure environment variables**
Create a `.env` file in the backend directory:
```env
PORT=8080
MONGO_URI=mongodb+srv://nikhil05052001_db_user:vZ33bND554m0xF00@cluster0.xsycled.mongodb.net/chatApp
JWT_SECRET=abcd1234!@#$ABCD
CLIENT_URL=http://localhost:5173
```

4. **Start MongoDB**
Make sure MongoDB is running on your system

5. **Start the backend server**
```bash
npm start
# or for development with auto-reload
npm run dev
```

Backend will run on `http://localhost:8080`

### Frontend Setup

1. **Navigate to frontend directory**
```bash
cd frontend
```

2. **Install dependencies**
```bash
npm install
```

3. **Start the development server**
```bash
npm run dev
```

Frontend will run on `http://localhost:5173`

### Authentication Flow

1. **Registration**: User creates account → Password hashed with bcrypt → Stored in MongoDB
2. **Login**: User submits credentials → Server verifies → JWT token generated → Sent to client
3. **Token Storage**: Client stores JWT in localStorage
4. **Protected Requests**: JWT sent in Authorization header → Server verifies → Access granted

### Real-Time Communication Flow

1. **Connection**: Client connects to Socket.IO server with JWT token
2. **Room Join**: User selects/creates room → Emits `room:join` event → Server adds to room
3. **Message Send**: User types message → Emits `message:send` event → Server broadcasts to room
4. **Message Receive**: All users in room receive `message:received` event → UI updates instantly

### Data Flow

#### Sending a Message
```
User Input → ChatWindow Component 
          → Socket.IO Client (emit 'message:send')
          → Socket.IO Server (receives event)
          → Save to MongoDB
          → Broadcast to room members
          → All clients receive and display message
```

#### Creating a Room
```
User Input → CreateRoomModal
          → POST /api/rooms
          → Server validates
          → Save to MongoDB
          → Return room data
          → Update UI with new room
```

## 🔌 WebSocket Events

### Client → Server Events

| Event | Data | Description |
|-------|------|-------------|
| `room:join` | `{ roomId }` | Join a chat room |
| `room:leave` | `{ roomId }` | Leave a chat room |
| `message:send` | `{ roomId, content, type }` | Send a message |
| `typing:start` | `{ roomId }` | User started typing |
| `typing:stop` | `{ roomId }` | User stopped typing |

### Server → Client Events

| Event | Data | Description |
|-------|------|-------------|
| `message:received` | `{ message, roomId }` | New message in room |
| `room:updated` | `{ room }` | Room data changed |
| `user:status` | `{ userId, status }` | User online/offline |
| `user:typing` | `{ userId, username, roomId }` | User typing indicator |
| `user:stopped-typing` | `{ userId, roomId }` | User stopped typing |

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/users` - Get all users

### Rooms
- `POST /api/rooms` - Create new room
- `GET /api/rooms` - Get user's rooms
- `GET /api/rooms/:id` - Get specific room
- `PUT /api/rooms/:id` - Update room
- `DELETE /api/rooms/:id` - Delete room

### Messages
- `POST /api/messages` - Send text message
- `POST /api/messages/upload` - Upload file/image
- `GET /api/messages/:roomId` - Get room messages
- `DELETE /api/messages/:id` - Delete message

## 🗄️ Database Schema

### User Model
```javascript
{
  username: String (unique),
  email: String (unique),
  password: String (hashed),
  avatar: String (URL),
  status: String (online/offline/away),
  lastSeen: Date,
  timestamps: true
}
```

### Room Model
```javascript
{
  name: String,
  description: String,
  type: String (group/private),
  creator: ObjectId (ref: User),
  members: [ObjectId] (ref: User),
  avatar: String (URL),
  lastMessage: ObjectId (ref: Message),
  timestamps: true
}
```

### Message Model
```javascript
{
  room: ObjectId (ref: Room),
  sender: ObjectId (ref: User),
  content: String,
  type: String (text/image/file),
  fileUrl: String,
  fileName: String,
  fileSize: Number,
  readBy: [{user: ObjectId, readAt: Date}],
  deleted: Boolean,
  timestamps: true
}
```

## 🎨 UI Components

### Key Components

1. **Login/Register** - Authentication forms
2. **Sidebar** - Room list with filters
3. **ChatWindow** - Main messaging interface
4. **Message** - Individual message display
5. **CreateRoomModal** - Room creation dialog

### State Management

- **AuthContext** - User authentication state
- **ChatContext** - Rooms, messages, and real-time updates
- **Local State** - Component-specific UI state

## 🔐 Security Features

- Password hashing with bcrypt
- JWT-based authentication
- Protected API routes
- File upload validation
- CORS configuration

## 🐛 Troubleshooting

### Common Issues

**MongoDB Connection Error**
- Ensure MongoDB is running
- Check connection string in `.env`

**Socket.IO Connection Failed**
- Verify backend server is running
- Check CORS configuration
- Ensure JWT token is valid

**File Upload Not Working**
- Check `uploads/` directory exists
- Verify file size limits
- Check file type restrictions



---
