import React from 'react';
import Sidebar from './Sidebar';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import styles from './ChatLayout.module.css';

export default function ChatLayout({ user, onLogout }) {
  return (
    <div className={styles.layout}>
      <Sidebar user={user} onLogout={onLogout} />
      <main className={styles.main}>
        <MessageList currentUser={user} />
        <MessageInput currentUser={user} />
      </main>
    </div>
  );
}
