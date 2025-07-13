import React, { useEffect, useState } from "react";
import { io } from "socket.io-client";
import axios from "axios";
import EmojiPicker from "emoji-picker-react";

const socket = io("http://localhost:5000");

export default function Chat({ user }) {
  const [users, setUsers] = useState([]);
  const [to, setTo] = useState(null);
  const [msg, setMsg] = useState("");
  const [messages, setMessages] = useState([]);
  const [showEmoji, setShowEmoji] = useState(false);

  useEffect(() => {
    socket.emit("join", user.username);

    socket.on("user list", setUsers);
    socket.on("private message", (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    return () => socket.disconnect();
  }, []);

  const selectUser = async (username) => {
    setTo(username);
    const res = await axios.get(
      `http://localhost:5000/messages/${user.username}/${username}`
    );
    setMessages(res.data);
  };

  const sendMessage = () => {
    if (msg.trim() !== "") {
      socket.emit("private message", { to, message: msg });
      setMessages((prev) => [
        ...prev,
        { from: user.username, message: msg, createdAt: new Date().toISOString() },
      ]);
      setMsg("");
    }
  };

  const uploadImage = async (e) => {
    const formData = new FormData();
    formData.append("image", e.target.files[0]);
    const res = await axios.post("http://localhost:5000/upload", formData);
    socket.emit("private message", { to, image: res.data.imageUrl });
    setMessages((prev) => [
      ...prev,
      {
        from: user.username,
        image: res.data.imageUrl,
        createdAt: new Date().toISOString(),
      },
    ]);
  };

  const styles = {
    chatContainer: {
      display: "flex",
      height: "100vh",
      width: "100vw",
      margin: 0,
      fontFamily: "Arial, sans-serif",
    },
    userList: {
      width: "25%",
      backgroundColor: "#1f1f1f",
      color: "#fff",
      padding: "20px",
      boxSizing: "border-box",
      overflowY: "auto",
    },
    chatPanel: {
      width: "75%",
      display: "flex",
      flexDirection: "column",
      backgroundColor: "#f0f0f0",
    },
    messages: {
      flex: 1,
      padding: "20px",
      overflowY: "auto",
    },
    messageBox: (isOwn) => ({
      display: "flex",
      flexDirection: "column",
      alignItems: isOwn ? "flex-end" : "flex-start",
      marginBottom: "10px",
    }),
    message: {
      maxWidth: "60%",
      padding: "10px",
      borderRadius: "8px",
      background: "#fff",
      wordBreak: "break-word",
      boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
    },
    timestamp: {
      fontSize: "12px",
      color: "#888",
      marginTop: "4px",
    },
    chatInput: {
      display: "flex",
      alignItems: "center",
      padding: "10px",
      background: "#fff",
      boxShadow: "0 -2px 5px rgba(0,0,0,0.1)",
    },
    inputText: {
      flex: 1,
      padding: "10px",
      border: "1px solid #ccc",
      borderRadius: "6px",
      fontSize: "14px",
    },
    iconButton: {
      marginLeft: "8px",
      padding: "8px",
      fontSize: "24px",
      background: "transparent",
      border: "none",
      cursor: "pointer",
    },
  };

  return (
    <div style={styles.chatContainer}>
      <div style={styles.userList}>
        <h3>Users Online ({users.length})</h3>
        {users.map((u) => (
          <div
            key={u}
            style={{
              padding: "12px",
              marginBottom: "8px",
              backgroundColor: to === u ? "#333" : "#2c2c2c",
              cursor: "pointer",
              borderRadius: "6px",
            }}
            onClick={() => selectUser(u)}
          >
            {u === user.username ? "You" : u}
          </div>
        ))}
      </div>

      <div style={styles.chatPanel}>
        <div style={styles.messages}>
          {messages.map((m, i) => {
            const isOwn = m.from === user.username;
            return (
              <div key={i} style={styles.messageBox(isOwn)}>
                <div style={styles.message}>
                  {m.message && <div>{m.message}</div>}
                  {m.image && (
                    <img
                      src={m.image}
                      alt="img"
                      width={150}
                      style={{ borderRadius: "8px", marginTop: "5px" }}
                    />
                  )}
                </div>
                <div style={styles.timestamp}>
                  {new Date(m.createdAt || Date.now()).toLocaleTimeString()}
                </div>
              </div>
            );
          })}
        </div>

        <div style={styles.chatInput}>
          <input
            type="text"
            placeholder="Type a message..."
            value={msg}
            onChange={(e) => setMsg(e.target.value)}
            style={styles.inputText}
          />

          <button
            style={styles.iconButton}
            onClick={() => setShowEmoji(!showEmoji)}
          >
            😊
          </button>

          <label style={styles.iconButton}>
            📎
            <input
              type="file"
              onChange={uploadImage}
              style={{ display: "none" }}
            />
          </label>

          <button
            style={{
              marginLeft: "8px",
              padding: "10px",
              background: "#007bff",
              color: "#fff",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
            }}
            onClick={sendMessage}
          >
            Send
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
