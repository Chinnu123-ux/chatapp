// === Chat.jsx ===
import React, { useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";
import axios from "axios";
import EmojiPicker from "emoji-picker-react";

const BACKEND_URL = "https://chat-app-backend-veyq.onrender.com"; // your backend URL

export default function Chat({ user }) {
  const [users, setUsers] = useState([]);
  const [to, setTo] = useState(null);
  const [msg, setMsg] = useState("");
  const [messages, setMessages] = useState([]);
  const [showEmoji, setShowEmoji] = useState(false);
  const [unreadCounts, setUnreadCounts] = useState({});
  const socketRef = useRef();

  useEffect(() => {
    socketRef.current = io(BACKEND_URL);

    socketRef.current.emit("join", user.username);

    socketRef.current.on("user list", (userList) => {
      setUsers(userList);
      const newUnreadCounts = {};
      userList.forEach((u) => {
        if (u !== user.username && !unreadCounts[u]) newUnreadCounts[u] = 0;
      });
      setUnreadCounts({ ...unreadCounts, ...newUnreadCounts });
    });

    socketRef.current.on("private message", (msg) => {
      msg.createdAt = msg.createdAt || new Date().toISOString();
      if (msg.from === to || msg.to === to || msg.from === user.username) {
        setMessages((prev) => [...prev, msg]);
      } else if (msg.from !== user.username) {
        setUnreadCounts((prev) => ({
          ...prev,
          [msg.from]: (prev[msg.from] || 0) + 1,
        }));
      }
    });

    return () => {
      socketRef.current.disconnect();
    };
  }, [user.username, to]);

  const selectUser = async (username) => {
    setTo(username);
    try {
      const res = await axios.get(`${BACKEND_URL}/messages/${user.username}/${username}`);
      const fetchedMessages = res.data.map((m) => ({
        ...m,
        createdAt: m.createdAt || new Date().toISOString(),
      }));
      setMessages(fetchedMessages);
      setUnreadCounts((prev) => ({ ...prev, [username]: 0 }));
    } catch (error) {
      console.error("Fetching messages failed:", error);
    }
  };

  const sendMessage = () => {
    if (!to || !msg.trim()) return;
    socketRef.current.emit("private message", {
      to,
      message: msg,
      from: user.username,
    });
    setMsg("");
  };

  const uploadImage = async (e) => {
    if (!to) return alert("Select a user first!");
    const formData = new FormData();
    formData.append("image", e.target.files[0]);
    try {
      const res = await axios.post(`${BACKEND_URL}/upload`, formData);
      socketRef.current.emit("private message", {
        to,
        image: res.data.imageUrl,
        from: user.username,
      });
    } catch (error) {
      console.error("Image upload failed:", error);
    }
  };

  return (
    <div style={{ display: "flex", height: "100vh", width: "100vw", overflow: "hidden" }}>
      <div style={{ width: "25%", background: "#222", color: "#fff", padding: "1rem", boxSizing: "border-box" }}>
        <h3>Users</h3>
        {users.map((u) => (
          <div
            key={u}
            onClick={() => selectUser(u)}
            style={{
