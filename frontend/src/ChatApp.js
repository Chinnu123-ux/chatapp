import React, { useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";
import EmojiPicker from "emoji-picker-react";

const socket = io("https://real-chat-app-lsni.onrender.com");

export default function ChatApp({ user }) {
  const { username } = user;
  const [input, setInput] = useState("");
  const [image, setImage] = useState(null);
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState("");
  const [showEmoji, setShowEmoji] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    if (username) socket.emit("join", username);

    socket.on("private message", (msg) => {
      if (
        (msg.from === username && msg.to === selectedUser) ||
        (msg.from === selectedUser && msg.to === username)
      ) {
        setMessages((prev) => [...prev, msg]);
      }
    });

    socket.on("user list", (list) => {
      setUsers(list.filter((u) => u !== username));
    });

    socket.on("user_offline", (user) => {
      alert(`User "${user}" is offline.`);
    });

    return () => {
      socket.off("private message");
      socket.off("user list");
      socket.off("user_offline");
    };
  }, [username, selectedUser]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (!selectedUser) return;

    const fetchMessages = async () => {
      try {
        const res = await fetch(
          `https://real-chat-app-lsni.onrender.com/messages/${username}/${selectedUser}`
        );
        if (!res.ok) throw new Error("Failed to fetch messages");
        const data = await res.json();
        setMessages(data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchMessages();
  }, [selectedUser, username]);

  const handleSend = (e) => {
    e.preventDefault();
    if ((!input.trim() && !image) || !selectedUser) return;

    socket.emit("private message", {
      to: selectedUser,
      message: input.trim(),
      image,
    });

    setMessages((prev) => [
      ...prev,
      {
        from: username,
        to: selectedUser,
        message: input.trim(),
        image,
        timestamp: new Date().toISOString(),
      },
    ]);

    setInput("");
    setImage(null);
    setShowEmoji(false);
  };

  return (
    <>
      <style>{`
        body {
          margin: 0;
          font-family: "Segoe UI", sans-serif;
          background: #f2f2fb;
        }
        .chat-app {
          display: flex;
          height: 100vh;
          background: #2d2553;
          border-radius: 20px;
          overflow: hidden;
          box-shadow: 0 0 30px rgba(0, 0, 0, 0.3);
          margin: 20px;
          color: white;
        }
        .sidebar {
          width: 300px;
          background: #3b3160;
          padding: 30px 20px;
          display: flex;
          flex-direction: column;
          border-radius: 20px 0 0 20px;
        }
        .sidebar h3 {
          margin-bottom: 20px;
          color: white;
        }
        .user-tile {
          padding: 12px;
          border-radius: 14px;
          margin-bottom: 10px;
          cursor: pointer;
          transition: 0.2s;
        }
        .user-tile:hover, .user-tile.active {
          background: #5c4b91;
        }
        .chat-panel {
          flex: 1;
          background: #2d2553;
          display: flex;
          flex-direction: column;
          padding: 30px;
          position: relative;
          border-radius: 0 20px 20px 0;
        }
        .chat-header {
          font-size: 18px;
          font-weight: bold;
          color: white;
          text-align: center;
          margin-bottom: 20px;
        }
        .message-container {
          flex: 1;
          overflow-y: auto;
          padding-right: 10px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .message {
          max-width: 60%;
          padding: 14px 18px;
          border-radius: 18px;
          color: white;
          font-size: 14px;
          position: relative;
          word-break: break-word;
        }
        .message.you {
          background:rgb(114, 186, 62);
          align-self: flex-end;
          border-radius: 18px 18px 0 18px;
        }
        .message.other {
          background: #4d3b7a;
          align-self: flex-start;
          border-radius: 18px 18px 18px 0;
        }
        .timestamp {
          font-size: 10px;
          color: #ccc;
          margin-top: 6px;
        }
        .input-area {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-top: 16px;
        }
        .input-area input[type="text"] {
          flex: 1;
          background: #443c6f;
          border: none;
          border-radius: 20px;
          padding: 12px 18px;
          color: white;
          font-size: 14px;
          outline: none;
        }
        .input-area button,
        .input-area label {
          background: none;
          border: none;
          color: white;
          font-size: 20px;
          cursor: pointer;
        }
        .input-area button.send {
          background: #6c63ff;
          color: white;
          padding: 10px 16px;
          border-radius: 50%;
          font-size: 18px;
        }
        .preview-image {
          margin-top: 10px;
        }
        .preview-image img {
          max-width: 200px;
          border-radius: 12px;
        }
        .emoji-picker {
          position: absolute;
          bottom: 100px;
          right: 40px;
          z-index: 1000;
        }
      `}</style>

      <div className="chat-app">
        <div className="sidebar">
          <h3>Online Users</h3>
          {users.length === 0 && <p>No other users online</p>}
          {users.map((u) => (
            <div
              key={u}
              className={`user-tile ${selectedUser === u ? "active" : ""}`}
              onClick={() => setSelectedUser(u)}
            >
              {u}
            </div>
          ))}
        </div>

        <div className="chat-panel">
          <div className="chat-header">
            {selectedUser ? `Chat with ${selectedUser}` : "Select a user to chat"}
          </div>

          <div className="message-container">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`message ${m.from === username ? "you" : "other"}`}
              >
                <div>{m.message}</div>
                {m.image && (
                  <img
                    src={m.image}
                    alt="sent"
                    style={{
                      maxWidth: "200px",
                      marginTop: 10,
                      borderRadius: 10,
                    }}
                  />
                )}
                <div className="timestamp">
                  {new Date(m.timestamp).toLocaleTimeString()}
                </div>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>

          {image && (
            <div className="preview-image">
              <img src={image} alt="preview" />
              <button onClick={() => setImage(null)}>Remove Image</button>
            </div>
          )}

          <form onSubmit={handleSend} className="input-area">
            <input
              type="text"
              placeholder={
                selectedUser ? "Type a message..." : "Select a user to chat"
              }
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={!selectedUser}
            />
            <button
              type="button"
              onClick={() => setShowEmoji(!showEmoji)}
              disabled={!selectedUser}
            >
              😊
            </button>
            <input
              type="file"
              accept="image/*"
              id="file-upload"
              style={{ display: "none" }}
              disabled={!selectedUser}
              onChange={(e) => {
                const file = e.target.files[0];
                if (file) {
                  const reader = new FileReader();
                  reader.onloadend = () => setImage(reader.result);
                  reader.readAsDataURL(file);
                }
              }}
            />
            <label htmlFor="file-upload">🖼️</label>
            <button
              type="submit"
              disabled={(!input.trim() && !image) || !selectedUser}
              className="send"
            >
              ➤
            </button>
          </form>

          {showEmoji && (
            <div className="emoji-picker">
              <EmojiPicker onEmojiClick={(e) => setInput((prev) => prev + e.emoji)} />
            </div>
          )}
        </div>
      </div>
    </>
  );
}
