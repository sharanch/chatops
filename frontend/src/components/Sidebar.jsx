import React from 'react';
import { useChat } from '../context/ChatContext';
import { useSocket } from '../context/SocketContext';
import { getAvatarColor, getInitials } from '../utils/helpers';
import styles from './Sidebar.module.css';

export default function Sidebar({ user, onLogout }) {
  const { rooms, activeRoom, switchRoom, onlineUsers } = useChat();
  const { connected } = useSocket();

  return (
    <aside className={styles.sidebar}>
      {/* Brand */}
      <div className={styles.brand}>
        <span className={styles.logoMark}>C</span>
        <span className={styles.logoText}>ChatOps</span>
        <div className={`${styles.connStatus} ${connected ? styles.online : styles.offline}`}
             title={connected ? 'Connected' : 'Disconnected'} />
      </div>

      {/* Channels */}
      <nav className={styles.section}>
        <p className={styles.sectionLabel}>
          <span className={styles.labelPrefix}>//</span> CHANNELS
        </p>
        <ul className={styles.list}>
          {rooms.map(room => (
            <li key={room.id}>
              <button
                className={`${styles.roomBtn} ${activeRoom === room.id ? styles.active : ''}`}
                onClick={() => switchRoom(room.id)}
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
          <span className={styles.labelPrefix}>//</span> ONLINE — {onlineUsers.length}
        </p>
        <ul className={styles.list}>
          {onlineUsers.map(u => (
            <li key={u.id} className={styles.userRow}>
              <span
                className={styles.avatar}
                style={{ '--av-color': getAvatarColor(u.username) }}
              >
                {getInitials(u.username)}
              </span>
              <span className={styles.userName}>{u.username}</span>
              <span className={styles.onlineDot} />
            </li>
          ))}
          {onlineUsers.length === 0 && (
            <li className={styles.empty}>No users online</li>
          )}
        </ul>
      </nav>

      {/* User footer */}
      <div className={styles.userFooter}>
        <span
          className={styles.avatar}
          style={{ '--av-color': getAvatarColor(user.username) }}
        >
          {getInitials(user.username)}
        </span>
        <div className={styles.userInfo}>
          <span className={styles.userName}>@{user.username}</span>
          <span className={styles.userStatus}>
            <span className={styles.onlineDot} /> Online
          </span>
        </div>
        <button className={styles.logoutBtn} onClick={onLogout} title="Disconnect">
          ⏻
        </button>
      </div>
    </aside>
  );
}
