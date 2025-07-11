import React, { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import axios from 'axios';
import EmojiPicker from 'emoji-picker-react';

const socket = io('http://localhost:5000');

export default function Chat({ user }) {
  const [users, setUsers] = useState([]);
  const [to, setTo] = useState(null);
  const [msg, setMsg] = useState('');
  const [messages, setMessages] = useState([]);
  const [showEmoji, setShowEmoji] = useState(false);

  useEffect(() => {
    socket.emit('join', user.username);

    socket.on('user list', setUsers);
    socket.on('private message', msg => {
      setMessages(prev => [...prev, msg]);
    });

    return () => socket.disconnect();
  }, []);

  const selectUser = async (username) => {
    setTo(username);
    const res = await axios.get(`http://localhost:5000/messages/${user.username}/${username}`);
    setMessages(res.data);
  };

  const sendMessage = () => {
    socket.emit('private message', { to, message: msg });
    setMsg('');
  };

  const uploadImage = async (e) => {
    const formData = new FormData();
    formData.append('image', e.target.files[0]);
    const res = await axios.post('http://localhost:5000/upload', formData);
    socket.emit('private message', { to, image: res.data.imageUrl });
  };

  return (
    <div style={{ display: 'flex' }}>
      <div style={{ width: '30%' }}>
        <h3>Users</h3>
        {users.map(u => (
          <div key={u} onClick={() => selectUser(u)}>{u}</div>
        ))}
      </div>
      <div style={{ width: '70%' }}>
        <div style={{ height: 300, overflowY: 'scroll' }}>
          {messages.map((m, i) => (
            <div key={i}>
              <strong>{m.from}</strong>: {m.message}
              {m.image && <img src={m.image} alt="img" width={100} />}
            </div>
          ))}
        </div>
        <input value={msg} onChange={e => setMsg(e.target.value)} />
        <button onClick={() => setShowEmoji(!showEmoji)}>😊</button>
        {showEmoji && <EmojiPicker onEmojiClick={e => setMsg(msg + e.emoji)} />}
        <button onClick={sendMessage}>Send</button>
        <input type="file" onChange={uploadImage} />
      </div>
    </div>
  );
}
