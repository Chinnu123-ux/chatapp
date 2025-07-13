const express = require('express');
const Message = require('../models/Message');
const router = express.Router();

// Get chat history
router.get('/:from/:to', async (req, res) => {
  const { from, to } = req.params;
  const messages = await Message.find({
    $or: [
      { from, to },
      { from: to, to: from }
    ]
  }).sort({ timestamp: 1 });
  res.json(messages);
});

module.exports = router;
