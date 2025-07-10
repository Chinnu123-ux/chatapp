const express = require('express');
const http = require('http');
const cors = require('cors');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Server } = require('socket.io');
require('dotenv').config(); // Load env vars (only for local dev)

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*' }
});

// ✅ MongoDB Atlas connection
mongoose.connect(process.env.MONGO_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("✅ MongoDB connected"))
.catch(err => console.error("❌ MongoDB error:", err));

// ✅ Middleware
app.use(cors());
app.use(express.json());

// ✅ User schema and model
const User = mongoose.model('User', new mongoose.Schema({
  username: String,
  email: { type: String, unique: true },
  password: String
}));

// ✅ Message schema and model
const Message = mongoose.model('Message', new mongoose.Schema({
  from: String,
  to: String,
  message: String,
  image: String,
  timestamp: { type: Date, default: Date.now }
}));

// ✅ In-memory online users map
const onlineUsers = new Map();

// ✅ Register endpoint
app.post('/register', async (req, res) => {
  const { username, email, password } = req.body;
  try {
    const hashed = await bcrypt.hash(password, 10);
    await User.create({ username, email, password: hashed });
    res.json({ message: "Registered successfully" });
  } catch (e) {
    console.error(e);
    res.status(400).json({ error: "Email already registered or invalid data" });
  }
});

// ✅ Login endpoint
app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(400).json({ error: "Invalid email" });

  const match = await bcrypt.compare(password, user.password);
  if (!match) return res.status(401).json({ error: "Wrong password" });

  const token = jwt.sign(
    { email: user.email, username: user.username },
    process.env.JWT_SECRET // ✅ secure secret
  );

  res.json({ token, username: user.username });
});

// ✅ Fetch chat history between two users
app.get('/messages/:user1/:user2', async (req, res) => {
  const { user1, user2 } = req.params;

  try {
    const messages = await Message.find({
      $or: [
        { from: user1, to: user2 },
        { from: user2, to: user1 }
      ]
    }).sort({ timestamp: 1 });

    res.json(messages);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch messages" });
  }
});

// ✅ Socket.io handling
io.on('connection', socket => {
  console.log('User connected', socket.id);

  socket.on('join', (username) => {
    onlineUsers.set(username, socket.id);
    io.emit('user list', Array.from(onlineUsers.keys()));
  });

  socket.on('private message', async ({ to, message, image }) => {
    const from = Array.from(onlineUsers).find(([k, v]) => v === socket.id)?.[0];
    if (!from) return;

    const timestamp = new Date();

    // Save to MongoDB
    await Message.create({ from, to, message, image, timestamp });

    const targetSocketId = onlineUsers.get(to);
    if (targetSocketId) {
      io.to(targetSocketId).emit('private message', {
        from,
        to,
        message,
        image,
        timestamp
      });
    } else {
      socket.emit('user_offline', to);
    }
  });

  socket.on('disconnect', () => {
    const user = Array.from(onlineUsers).find(([_, id]) => id === socket.id)?.[0];
    if (user) {
      onlineUsers.delete(user);
      io.emit('user list', Array.from(onlineUsers.keys()));
    }
  });
});

// ✅ Dynamic PORT for Render or fallback to 5000
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
