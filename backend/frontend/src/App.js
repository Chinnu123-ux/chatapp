import React, { useState } from 'react';
import LoginRegister from './LoginRegister';
import Chat from './Chat';

function App() {
  const [user, setUser] = useState(null);

  return (
    <div>
      {!user ? <LoginRegister onLoggedIn={setUser} /> : <Chat user={user} />}
    </div>
  );
}

export default App;
