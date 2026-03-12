const { Server } = require('socket.io');
const { createAdapter } = require('@socket.io/redis-adapter');
const { pubClient, subClient } = require('../config/redis');
const { saveMessage, getMessages, VALID_ROOMS } = require('../controllers/messageController');
const logger = require('../utils/logger');

// In-memory online users map: socketId → { id, username }
const onlineUsers = new Map();

function broadcastOnlineUsers(io) {
  const users = Array.from(onlineUsers.values());
  io.emit('online_users', users);
}

function setupSocket(server) {
  const io = new Server(server, {
    cors: {
      origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
      methods: ['GET', 'POST'],
      credentials: true,
    },
    pingTimeout: 20000,
    pingInterval: 10000,
  });

  // ── Redis adapter for horizontal scaling across K8s pods ──
  io.adapter(createAdapter(pubClient, subClient));
  logger.info('Socket.io Redis adapter attached');

  // ── Auth middleware ──────────────────────────────────────
  io.use((socket, next) => {
    const { username, userId } = socket.handshake.auth;

    if (!username || typeof username !== 'string') {
      return next(new Error('Username required'));
    }
    if (username.length < 2 || username.length > 20) {
      return next(new Error('Invalid username length'));
    }
    if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
      return next(new Error('Invalid username format'));
    }

    socket.user = { id: userId || socket.id, username };
    next();
  });

  // ── Connection ───────────────────────────────────────────
  io.on('connection', (socket) => {
    const { user } = socket;
    logger.info('User connected', { username: user.username, socketId: socket.id });

    // Track online
    onlineUsers.set(socket.id, user);
    broadcastOnlineUsers(io);

    // Auto-join general
    socket.join('general');

    // ── Join room ──────────────────────────────────────────
    socket.on('join_room', (roomId) => {
      if (!VALID_ROOMS.includes(roomId)) return;
      socket.join(roomId);
      logger.debug('User joined room', { username: user.username, roomId });
    });

    // ── Leave room ─────────────────────────────────────────
    socket.on('leave_room', (roomId) => {
      socket.leave(roomId);
    });

    // ── Fetch message history ──────────────────────────────
    socket.on('get_messages', async ({ roomId }) => {
      if (!VALID_ROOMS.includes(roomId)) return;
      try {
        const messages = await getMessages(roomId);
        socket.emit('message_history', { roomId, messages });
      } catch (err) {
        logger.error('get_messages error', { error: err.message });
        socket.emit('error', { message: 'Failed to load messages' });
      }
    });

    // ── Send message ───────────────────────────────────────
    socket.on('send_message', async ({ roomId, content }) => {
      if (!VALID_ROOMS.includes(roomId)) return;
      if (!content || typeof content !== 'string') return;

      const trimmed = content.trim();
      if (!trimmed || trimmed.length > 2000) return;

      try {
        const message = await saveMessage({
          roomId,
          userId:   user.id,
          username: user.username,
          content:  trimmed,
        });

        // Broadcast to everyone in the room (including sender)
        io.to(roomId).emit('message', message);
        logger.debug('Message sent', { username: user.username, roomId });
      } catch (err) {
        logger.error('send_message error', { error: err.message });
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // ── Typing indicator ───────────────────────────────────
    socket.on('typing', ({ roomId, isTyping }) => {
      if (!VALID_ROOMS.includes(roomId)) return;
      socket.to(roomId).emit('typing', {
        roomId,
        username: user.username,
        isTyping: Boolean(isTyping),
      });
    });

    // ── Disconnect ─────────────────────────────────────────
    socket.on('disconnect', (reason) => {
      logger.info('User disconnected', { username: user.username, reason });
      onlineUsers.delete(socket.id);
      broadcastOnlineUsers(io);
    });
  });

  return io;
}

module.exports = { setupSocket };
