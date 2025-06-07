import React, { useState } from "react";
import LoginRegister from "./LoginRegister";
import ChatApp from "./ChatApp";

export default function App() {
  const [user, setUser] = useState(null); // { username, token }

  return (
    <div>
      {!user ? (
        <LoginRegister setUser={setUser} />
      ) : (
        <ChatApp user={user} />
      )}
    </div>
  );
}
