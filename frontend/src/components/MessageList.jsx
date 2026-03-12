import React, { useEffect, useRef } from 'react';
import { useChat } from '../context/ChatContext';
import { useSocket } from '../context/SocketContext';
import { formatMessageTime, getAvatarColor, getInitials, groupMessagesByUser } from '../utils/helpers';
import styles from './MessageList.module.css';

function TypingIndicator({ users }) {
  if (!users || users.length === 0) return null;
  const label = users.length === 1
    ? `${users[0]} is typing`
    : users.length === 2
      ? `${users[0]} and ${users[1]} are typing`
      : `${users.length} people are typing`;

  return (
    <div className={styles.typing}>
      <span className={styles.typingDots}>
        <span /><span /><span />
      </span>
      <span className={styles.typingText}>{label}…</span>
    </div>
  );
}

function MessageGroup({ group, currentUserId }) {
  const isOwn = group.userId === currentUserId;
  const color = getAvatarColor(group.username);

  return (
    <div className={`${styles.group} ${isOwn ? styles.own : ''}`}>
      {!isOwn && (
        <span className={styles.avatar} style={{ '--av-color': color }}>
          {getInitials(group.username)}
        </span>
      )}
      <div className={styles.groupContent}>
        {!isOwn && (
          <div className={styles.groupHeader}>
            <span className={styles.username} style={{ color }}>@{group.username}</span>
            <span className={styles.time}>
              {formatMessageTime(group.messages[0].createdAt)}
            </span>
          </div>
        )}
        <div className={styles.bubbles}>
          {group.messages.map((msg, i) => (
            <div key={msg.id || i} className={styles.bubble}>
              <span className={styles.content}>{msg.content}</span>
              {isOwn && i === group.messages.length - 1 && (
                <span className={styles.ownTime}>{formatMessageTime(msg.createdAt)}</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function MessageList({ currentUser, onMenuClick }) {
  const { messages, activeRoom, rooms, typingUsers } = useChat();
  const { connected } = useSocket();
  const bottomRef = useRef(null);

  const roomMessages = messages[activeRoom] || [];
  const grouped = groupMessagesByUser(roomMessages);
  const typing = typingUsers[activeRoom] || [];
  const activeRoomObj = rooms.find(r => r.id === activeRoom);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [roomMessages, typing]);

  return (
    <div className={styles.wrapper}>
      <div className={styles.roomHeader}>
        {/* Hamburger — mobile only */}
        <button className={styles.menuBtn} onClick={onMenuClick} aria-label="Open menu">
          ☰
        </button>
        <div className={styles.roomInfo}>
          <span className={styles.roomHash}>#</span>
          <span className={styles.roomName}>{activeRoomObj?.name}</span>
        </div>
        <p className={styles.roomDesc}>{activeRoomObj?.description}</p>
        {!connected && (
          <div className={styles.disconnectBanner}>
            ⚠ Reconnecting…
          </div>
        )}
      </div>

      <div className={styles.list}>
        {grouped.length === 0 && (
          <div className={styles.empty}>
            <span className={styles.emptyIcon}>#</span>
            <p>No messages yet. Say hello!</p>
          </div>
        )}
        {grouped.map((group, i) => (
          <MessageGroup
            key={`${group.userId}-${i}`}
            group={group}
            currentUserId={currentUser.id}
          />
        ))}
        <TypingIndicator users={typing.filter(u => u !== currentUser.username)} />
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
