import React, { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import styles from './Login.module.css';

export default function Login({ onLogin }) {
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = username.trim();
    if (!trimmed) { setError('Username is required'); return; }
    if (trimmed.length < 2) { setError('At least 2 characters'); return; }
    if (trimmed.length > 20) { setError('Max 20 characters'); return; }
    if (!/^[a-zA-Z0-9_-]+$/.test(trimmed)) { setError('Letters, numbers, _ and - only'); return; }
    onLogin({ id: uuidv4(), username: trimmed });
  };

  return (
    <div className={styles.container}>
      {/* Animated grid background */}
      <div className={styles.grid} aria-hidden="true" />
      <div className={styles.scanline} aria-hidden="true" />

      <div className={styles.card}>
        <div className={styles.logo}>
          <span className={styles.logoMark}>C</span>
          <span className={styles.logoText}>ChatOps</span>
        </div>

        <p className={styles.tagline}>
          Real-time team communication.<br />
          <span className={styles.accent}>Can be used as an Intercomm</span>
        </p>

        <form onSubmit={handleSubmit} className={styles.form} noValidate>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="username">
              <span className={styles.labelPrefix}>//</span> HANDLE
            </label>
            <div className={styles.inputWrap}>
              <span className={styles.inputPrefix}>@</span>
              <input
                id="username"
                type="text"
                className={styles.input}
                placeholder="your_username"
                value={username}
                onChange={(e) => { setUsername(e.target.value); setError(''); }}
                autoComplete="off"
                autoFocus
                maxLength={20}
              />
            </div>
            {error && <p className={styles.error}>{error}</p>}
          </div>

          <button type="submit" className={styles.btn}>
            <span>CONNECT</span>
            <span className={styles.btnArrow}>→</span>
          </button>
        </form>

        <div className={styles.footer}>
          <span className={styles.dot} />
          <span>No account needed — just connect</span>
        </div>
      </div>
    </div>
  );
}
