import React, { useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";
import axios from "axios";
import EmojiPicker from "emoji-picker-react";

export default function Chat({ user }) {
  const [users, setUsers] = useState([]);
  const [to, setTo] = useState(null);
  const [msg, setMsg] = useState("");
  const [messages, setMessages] = useState([]);
  const [showEmoji, setShowEmoji] = useState(false);
  const [unreadCounts, setUnreadCounts] = useState({});
  const socketRef = useRef();

  useEffect(() => {
    socketRef.current = io("https://chat-app-backend-veyq.onrender.com");

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
      const res = await axios.get(`http://localhost:5000/messages/${user.username}/${username}`);
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
      const res = await axios.post("http://localhost:5000/upload", formData);
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
              padding: "10px",
              background: to === u ? "#444" : "#333",
              marginBottom: "8px",
              cursor: "pointer",
              borderRadius: "6px",
              position: "relative",
            }}
          >
            {u === user.username ? "You" : u}
            {unreadCounts[u] > 0 && (
              <span
                style={{
                  background: "red",
                  borderRadius: "50%",
                  padding: "4px 8px",
                  position: "absolute",
                  right: "10px",
                  top: "10px",
                  fontSize: "12px",
                }}
              >
                {unreadCounts[u]}
              </span>
            )}
          </div>
        ))}
      </div>

      <div style={{ width: "75%", display: "flex", flexDirection: "column" }}>
        <div style={{ background: "#eee", padding: "10px", textAlign: "center", borderBottom: "1px solid #ccc" }}>
          <h3>{to ? `Chatting with: ${to === user.username ? "You" : to}` : "Select a user"}</h3>
        </div>

        <div style={{ flex: 1, padding: "20px", overflowY: "auto", background: "#f4f4f4" }}>
          {messages.map((m, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                justifyContent: m.from === user.username ? "flex-end" : "flex-start",
                marginBottom: "10px",
              }}
            >
              <div
                style={{
                  background: "#fff",
                  padding: "10px",
                  borderRadius: "8px",
                  maxWidth: "60%",
                  wordBreak: "break-word",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                }}
              >
                {m.message && <div>{m.message}</div>}
                {m.image && <img src={m.image} alt="img" style={{ maxWidth: "150px", borderRadius: "8px" }} />}
                <div style={{ fontSize: "11px", color: "#777", marginTop: "5px" }}>
                  {new Date(m.createdAt).toLocaleTimeString()}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div style={{ display: "flex", padding: "10px", background: "#fff", borderTop: "1px solid #ccc", gap: "10px" }}>
          <input
            type="text"
            value={msg}
            onChange={(e) => setMsg(e.target.value)}
            placeholder="Type message..."
            style={{ flex: 1, padding: "10px", borderRadius: "6px", border: "1px solid #ccc" }}
          />

          <button
            onClick={() => setShowEmoji(!showEmoji)}
            style={{
              background: "#ff5733",
              color: "#fff",
              border: "none",
              borderRadius: "30px",
              padding: "10px 20px",
              cursor: "pointer",
            }}
          >
            😊
          </button>

          <label
            style={{
              background: "#ff5733",
              color: "#fff",
              border: "none",
              borderRadius: "30px",
              padding: "10px 20px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            📎
            <input type="file" style={{ display: "none" }} onChange={uploadImage} />
          </label>

          <button
            onClick={sendMessage}
            style={{
              background: "#ff5733",
              color: "#fff",
              border: "none",
              borderRadius: "30px",
              padding: "10px 20px",
              cursor: "pointer",
              fontWeight: "bold",
            }}
          >
            SEND
          </button>
        </div>

        {showEmoji && (
          <div style={{ position: "absolute", bottom: "80px", right: "20px", zIndex: 10 }}>
            <EmojiPicker onEmojiClick={(e) => setMsg(msg + e.emoji)} />
          </div>
        )}
      </div>
    </div>
  );
}
