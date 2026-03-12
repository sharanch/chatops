import { format, isToday, isYesterday } from 'date-fns';

export function formatMessageTime(dateStr) {
  const date = new Date(dateStr);
  if (isToday(date)) return format(date, 'HH:mm');
  if (isYesterday(date)) return `Yesterday ${format(date, 'HH:mm')}`;
  return format(date, 'MMM d, HH:mm');
}

export function getAvatarColor(username) {
  const colors = [
    '#00e5ff', '#7c3aed', '#22c55e', '#f59e0b',
    '#ef4444', '#ec4899', '#3b82f6', '#14b8a6',
  ];
  let hash = 0;
  for (let i = 0; i < username.length; i++) {
    hash = username.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

export function getInitials(username) {
  return username.slice(0, 2).toUpperCase();
}

export function groupMessagesByUser(messages) {
  const groups = [];
  messages.forEach((msg, i) => {
    const prev = messages[i - 1];
    const sameUser = prev && prev.username === msg.username;
    const within5min = prev && (new Date(msg.createdAt) - new Date(prev.createdAt)) < 5 * 60 * 1000;
    if (sameUser && within5min) {
      groups[groups.length - 1].messages.push(msg);
    } else {
      groups.push({ username: msg.username, userId: msg.userId, messages: [msg] });
    }
  });
  return groups;
}
