import React from 'react';
import Login from './components/Login';
import ChatLayout from './components/ChatLayout';
import { SocketProvider } from './context/SocketContext';
import { ChatProvider } from './context/ChatContext';
import { useLocalStorage } from './hooks/useLocalStorage';

export default function App() {
  const [user, setUser] = useLocalStorage('chatops_user', null);

  const handleLogin = (userData) => setUser(userData);
  const handleLogout = () => setUser(null);

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <SocketProvider user={user}>
      <ChatProvider>
        <ChatLayout user={user} onLogout={handleLogout} />
      </ChatProvider>
    </SocketProvider>
  );
}
