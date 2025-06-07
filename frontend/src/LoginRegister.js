import React, { useState, useEffect } from "react";

export default function LoginRegister({ setUser }) {
  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const API = "http://localhost:5000";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (isRegister && !username.trim()) {
      setError("Username is required for registration.");
      return;
    }

    try {
      const res = await fetch(isRegister ? API + "/register" : API + "/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(isRegister ? { username, email, password } : { email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong");
        return;
      }

      if (!isRegister) {
        setUser({ username: data.username, token: data.token });
      } else {
        alert("Registered successfully! Please login.");
        setIsRegister(false);
        setUsername("");
        setEmail("");
        setPassword("");
      }
    } catch (err) {
      setError("Failed to connect to server");
    }
  };

  useEffect(() => {
    const style = document.createElement("style");
    style.innerHTML = `
      @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;600&display=swap');
      
      body {
        margin: 0;
        font-family: 'Poppins', sans-serif;
        background-color: #1e1e2f;
      }

      .login-container {
        display: flex;
        justify-content: center;
        align-items: center;
        height: 100vh;
      }

      .login-box {
        display: flex;
        width: 700px;
        height: 420px;
        border-radius: 10px;
        overflow: hidden;
        background: linear-gradient(145deg, #1c1b29, #2a2a3d);
        box-shadow: 0 0 20px #ff0080;
      }

      .left, .right {
        width: 50%;
        padding: 40px 30px;
        box-sizing: border-box;
      }

      .left {
        background-color: #1c1b29;
        color: #fff;
      }

      .left h2 {
        font-size: 28px;
        margin-bottom: 30px;
        font-weight: 600;
      }

      .input-box {
        margin-bottom: 20px;
      }

      .input-box input {
        width: 100%;
        padding: 10px;
        background: transparent;
        border: none;
        border-bottom: 2px solid #fff;
        color: #fff;
        font-size: 16px;
        outline: none;
      }

      button {
        width: 100%;
        padding: 12px;
        margin-top: 10px;
        border: none;
        border-radius: 25px;
        background: linear-gradient(to right, #ff007a, #ff4e9b);
        color: white;
        font-size: 16px;
        cursor: pointer;
        transition: 0.3s ease;
      }

      button:hover {
        transform: scale(1.05);
      }

      .toggle-text {
        margin-top: 20px;
        font-size: 14px;
        color: #aaa;
      }

      .toggle-text span {
        color: #ff007a;
        font-weight: 600;
        cursor: pointer;
      }

      .error {
        color: #ff4e4e;
        margin-top: 10px;
      }

      .right {
        background: linear-gradient(120deg, #ff007a, #ff4e9b);
        color: white;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        text-align: center;
      }

      .right h1 {
        font-size: 32px;
        font-weight: 700;
        margin-bottom: 20px;
      }

      .right p {
        font-size: 14px;
        max-width: 220px;
      }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  return (
    <div className="login-container">
      <div className="login-box">
        <div className="left">
          <h2>{isRegister ? "Register" : "Login"}</h2>
          <form onSubmit={handleSubmit}>
            {isRegister && (
              <div className="input-box">
                <input
                  type="text"
                  placeholder="Username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>
            )}
            <div className="input-box">
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="input-box">
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <button type="submit">{isRegister ? "Register" : "Login"}</button>
            {error && <p className="error">{error}</p>}
          </form>
          <p className="toggle-text">
            {isRegister ? "Already have an account?" : "Don't have an account?"}{" "}
            <span onClick={() => setIsRegister(!isRegister)}>
              {isRegister ? "Login" : "Register"}
            </span>
          </p>
        </div>
        <div className="right">
          <h1>WELCOME<br /> TO THE  <br />CHAT APP<br /></h1>
          
        </div>
      </div>
    </div>
  );
}
