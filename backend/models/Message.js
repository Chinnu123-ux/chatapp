const mongoose = require('mongoose');
const Message = require('./models/Message'); // Adjust the path if needed

const messageSchema = new mongoose.Schema({
  from: String,
  to: String,
  message: String,
  image: String,  // optional
  timestamp: { type: Date, default: Date.now }
});

const Message = mongoose.model('Message', messageSchema);

module.exports = Message;
