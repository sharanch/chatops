import React, { useState, useRef, useCallback } from 'react';
import { useChat } from '../context/ChatContext';
import { useSocket } from '../context/SocketContext';
import { useTyping } from '../hooks/useTyping';
import styles from './MessageInput.module.css';

export default function MessageInput({ currentUser }) {
  const [value, setValue] = useState('');
  const { sendMessage, activeRoom } = useChat();
  const { connected } = useSocket();
  const { onType, onBlur } = useTyping();
  const textareaRef = useRef(null);

  const handleChange = (e) => {
    setValue(e.target.value);
    onType();
    const el = textareaRef.current;
    if (el) {
      el.style.height = 'auto';
      el.style.height = Math.min(el.scrollHeight, 140) + 'px';
    }
  };

  const submit = useCallback(() => {
    if (!value.trim() || !connected) return;
    sendMessage(value.trim());
    setValue('');
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
  }, [value, connected, sendMessage]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  };

  return (
    <div className={styles.wrapper}>
      <div className={`${styles.inputBox} ${!connected ? styles.disabled : ''}`}>
        <div className={styles.roomTag}>
          sharan@chatops:~$
        </div>
        <textarea
          ref={textareaRef}
          className={styles.textarea}
          placeholder={connected ? `type a message...` : 'reconnecting…'}
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onBlur={onBlur}
          disabled={!connected}
          rows={1}
          aria-label={`Message input for #${activeRoom}`}
        />
        <button
          className={styles.sendBtn}
          onClick={submit}
          disabled={!value.trim() || !connected}
          aria-label="Send message"
        >
          <SendIcon />
        </button>
      </div>
      <p className={styles.hint}>
        <kbd>Enter</kbd> to send · <kbd>Shift+Enter</kbd> for newline
      </p>
    </div>
  );
}

function SendIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="22" y1="2" x2="11" y2="13" />
      <polygon points="22 2 15 22 11 13 2 9 22 2" />
    </svg>
  );
}