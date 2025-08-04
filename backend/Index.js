const express = require('express');
const http = require('http');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const socketIO = require('socket.io');
const authRoutes = require('./routes/auth');
const messageRoutes = require('./routes/messages');
const Message = require('./models/Message');

const app = express();
const server = http.createServer(app);
const io = socketIO(server, { cors: { origin: '*' } });

mongoose.connect('mongodb://localhost:27017/chatapp');

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/', authRoutes);
app.use('/messages', messageRoutes);

// Upload route
const storage = multer.diskStorage({
  destination: './uploads/',
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage });
app.post('/upload', upload.single('image'), (req, res) => {
  const imageUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
res.json({ imageUrl });

});

const users = {};

io.on('connection', socket => {
  console.log('🟢 Connected:', socket.id);

  socket.on('join', (username) => {
    users[socket.id] = username;
    socket.join(username);
    io.emit('user list', Object.values(users));
  });

  socket.on('private message', async ({ to, message, image }) => {
    const from = users[socket.id];
    const msg = new Message({ from, to, message, image });
    await msg.save();
    io.to(to).emit('private message', msg);
    io.to(from).emit('private message', msg);
  });

  socket.on('disconnect', () => {
    const username = users[socket.id];
    delete users[socket.id];
    io.emit('user list', Object.values(users));
    console.log('🔴 Disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🚀 Backend running on port ${PORT}`));

