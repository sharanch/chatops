import React from 'react';
import { useChat } from '../context/ChatContext';
import { useSocket } from '../context/SocketContext';
import { getAvatarColor, getInitials } from '../utils/helpers';
import styles from './Sidebar.module.css';

export default function Sidebar({ user, onLogout, isOpen, onClose }) {
  const { rooms, activeRoom, switchRoom, onlineUsers } = useChat();
  const { connected } = useSocket();

  const handleRoomSwitch = (roomId) => {
    switchRoom(roomId);
    onClose();
  };

  return (
    <>
      {isOpen && <div className={styles.backdrop} onClick={onClose} />}

      <aside className={`${styles.sidebar} ${isOpen ? styles.open : ''}`}>
        {/* Terminal header bar */}
        <div className={styles.brand}>
          <div className={`${styles.termDot} ${styles.dotRed}`} />
          <div className={`${styles.termDot} ${styles.dotYellow}`} />
          <div className={`${styles.termDot} ${styles.dotGreen}`} />
          <span className={styles.logoText}>chatops — channels</span>
          <div className={`${styles.connStatus} ${connected ? styles.online : styles.offline}`}
               title={connected ? 'Connected' : 'Disconnected'} />
          <button className={styles.closeBtn} onClick={onClose} aria-label="Close sidebar">✕</button>
        </div>

        {/* Channels */}
        <nav className={styles.section}>
          <p className={styles.sectionLabel}>
            <span className={styles.labelPrefix}>&gt;</span> CHANNELS
          </p>
          <ul className={styles.list}>
            {rooms.map(room => (
              <li key={room.id}>
                <button
                  className={`${styles.roomBtn} ${activeRoom === room.id ? styles.active : ''}`}
                  onClick={() => handleRoomSwitch(room.id)}
                  title={room.description}
                >
                  <span className={styles.hash}>#</span>
                  <span className={styles.roomName}>{room.name}</span>
                  {room.unread > 0 && (
                    <span className={styles.badge}>{room.unread}</span>
                  )}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        {/* Online users */}
        <nav className={styles.section}>
          <p className={styles.sectionLabel}>
            <span className={styles.labelPrefix}>&gt;</span> ONLINE — {onlineUsers.length}
          </p>
          <ul className={styles.list}>
            {onlineUsers.map(u => (
              <li key={u.id} className={styles.userRow}>
                <span className={styles.avatar} style={{ '--av-color': getAvatarColor(u.username) }}>
                  {getInitials(u.username)}
                </span>
                <span className={styles.userName}>{u.username}</span>
                <span className={styles.onlineDot} />
              </li>
            ))}
            {onlineUsers.length === 0 && (
              <li className={styles.empty}>no users online</li>
            )}
          </ul>
        </nav>

        {/* User footer — terminal prompt style */}
        <div className={styles.userFooter}>
          <span className={styles.avatar} style={{ '--av-color': getAvatarColor(user.username) }}>
            {getInitials(user.username)}
          </span>
          <div className={styles.userInfo}>
            <span className={styles.userName}>sharan@chatops:~$</span>
            <span className={styles.userStatus}>
              <span className={styles.onlineDot} /> {user.username}
            </span>
          </div>
          <button className={styles.logoutBtn} onClick={onLogout} title="Disconnect">⏻</button>
        </div>
      </aside>
    </>
  );
}