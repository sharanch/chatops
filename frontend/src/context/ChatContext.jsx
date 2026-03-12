import React, { createContext, useContext, useEffect, useReducer, useCallback } from 'react';
import { useSocket } from './SocketContext';

const ChatContext = createContext(null);

const initialState = {
  rooms: [
    { id: 'general', name: 'general', description: 'General discussion', unread: 0 },
    { id: 'devops', name: 'devops', description: 'DevOps & infra talk', unread: 0 },
    { id: 'random', name: 'random', description: 'Off-topic stuff', unread: 0 },
  ],
  activeRoom: 'general',
  messages: {},       // { roomId: [msg, ...] }
  onlineUsers: [],
  typingUsers: {},    // { roomId: [username, ...] }
};

function reducer(state, action) {
  switch (action.type) {
    case 'SET_ACTIVE_ROOM':
      return {
        ...state,
        activeRoom: action.roomId,
        rooms: state.rooms.map(r =>
          r.id === action.roomId ? { ...r, unread: 0 } : r
        ),
      };

    case 'ADD_MESSAGE': {
      const { roomId, message } = action;
      const existing = state.messages[roomId] || [];
      const isActive = state.activeRoom === roomId;
      return {
        ...state,
        messages: { ...state.messages, [roomId]: [...existing, message] },
        rooms: state.rooms.map(r =>
          r.id === roomId && !isActive ? { ...r, unread: r.unread + 1 } : r
        ),
      };
    }

    case 'SET_MESSAGES':
      return {
        ...state,
        messages: { ...state.messages, [action.roomId]: action.messages },
      };

    case 'SET_ONLINE_USERS':
      return { ...state, onlineUsers: action.users };

    case 'SET_TYPING': {
      const { roomId, username, isTyping } = action;
      const current = state.typingUsers[roomId] || [];
      const updated = isTyping
        ? [...new Set([...current, username])]
        : current.filter(u => u !== username);
      return { ...state, typingUsers: { ...state.typingUsers, [roomId]: updated } };
    }

    default:
      return state;
  }
}

export function ChatProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const { socket, connected } = useSocket();

  useEffect(() => {
    if (!socket || !connected) return;

    socket.emit('join_room', state.activeRoom);
    socket.emit('get_messages', { roomId: state.activeRoom });

    const onMessage = (msg) => dispatch({ type: 'ADD_MESSAGE', roomId: msg.roomId, message: msg });
    const onHistory = ({ roomId, messages }) => dispatch({ type: 'SET_MESSAGES', roomId, messages });
    const onOnlineUsers = (users) => dispatch({ type: 'SET_ONLINE_USERS', users });
    const onTyping = ({ roomId, username, isTyping }) =>
      dispatch({ type: 'SET_TYPING', roomId, username, isTyping });

    socket.on('message', onMessage);
    socket.on('message_history', onHistory);
    socket.on('online_users', onOnlineUsers);
    socket.on('typing', onTyping);

    return () => {
      socket.off('message', onMessage);
      socket.off('message_history', onHistory);
      socket.off('online_users', onOnlineUsers);
      socket.off('typing', onTyping);
    };
  }, [socket, connected, state.activeRoom]);

  const sendMessage = useCallback((content) => {
    if (!socket || !content.trim()) return;
    socket.emit('send_message', { roomId: state.activeRoom, content });
  }, [socket, state.activeRoom]);

  const switchRoom = useCallback((roomId) => {
    if (!socket) return;
    socket.emit('leave_room', state.activeRoom);
    socket.emit('join_room', roomId);
    socket.emit('get_messages', { roomId });
    dispatch({ type: 'SET_ACTIVE_ROOM', roomId });
  }, [socket, state.activeRoom]);

  const emitTyping = useCallback((isTyping) => {
    if (!socket) return;
    socket.emit('typing', { roomId: state.activeRoom, isTyping });
  }, [socket, state.activeRoom]);

  return (
    <ChatContext.Provider value={{ ...state, sendMessage, switchRoom, emitTyping }}>
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  return useContext(ChatContext);
}
