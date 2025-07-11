import React, { useState } from 'react';
import './LoginRegister.css';
import axios from 'axios';

const LoginRegister = ({ onLoggedIn }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [login, setLogin] = useState({ email: '', password: '' });
  const [register, setRegister] = useState({ username: '', email: '', password: '' });

  const handleLogin = async (e) => {
    e.preventDefault();
    const res = await axios.post('http://localhost:5000/login', login);
    onLoggedIn(res.data);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    await axios.post('http://localhost:5000/register', register);
    onLoggedIn({ username: register.username, email: register.email });
  };

  return (
    <div className={`container ${isSignUp ? "sign-up-mode" : ""}`}>
      <div className="form-container sign-in-container">
        <form onSubmit={handleLogin}>
          <h1>Sign in</h1>
          <input type="email" placeholder="Email" onChange={e => setLogin({ ...login, email: e.target.value })} />
          <input type="password" placeholder="Password" onChange={e => setLogin({ ...login, password: e.target.value })} />
          
          <button>Sign In</button>
        </form>
      </div>
      <div className="form-container sign-up-container">
        <form onSubmit={handleRegister}>
          <h1>Create Account</h1>
          <input type="text" placeholder="Username" onChange={e => setRegister({ ...register, username: e.target.value })} />
          <input type="email" placeholder="Email" onChange={e => setRegister({ ...register, email: e.target.value })} />
          <input type="password" placeholder="Password" onChange={e => setRegister({ ...register, password: e.target.value })} />
          <button>Sign Up</button>
        </form>
      </div>
      <div className="overlay-container">
        <div className="overlay">
          <div className="overlay-panel overlay-left">
            <h1>Welcome Back!</h1>
            <p>To stay connected, please log in</p>
            <button className="ghost" onClick={() => setIsSignUp(false)}>Sign In</button>
          </div>
          <div className="overlay-panel overlay-right">
            <h1>Hello, Friend!</h1>
            <p>Enter your personal details and start journey with us</p>
            <button className="ghost" onClick={() => setIsSignUp(true)}>Sign Up</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginRegister;
