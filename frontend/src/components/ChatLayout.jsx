import React, { useState } from 'react';
import Sidebar from './Sidebar';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import styles from './ChatLayout.module.css';

export default function ChatLayout({ user, onLogout }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className={styles.layout}>
      <Sidebar
        user={user}
        onLogout={onLogout}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      <main className={styles.main}>
        <MessageList
          currentUser={user}
          onMenuClick={() => setSidebarOpen(true)}
        />
        <MessageInput currentUser={user} />
      </main>
    </div>
  );
}
