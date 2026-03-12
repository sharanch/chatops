import { useRef, useCallback } from 'react';
import { useChat } from '../context/ChatContext';

export function useTyping() {
  const { emitTyping } = useChat();
  const typingTimerRef = useRef(null);
  const isTypingRef = useRef(false);

  const onType = useCallback(() => {
    if (!isTypingRef.current) {
      isTypingRef.current = true;
      emitTyping(true);
    }
    clearTimeout(typingTimerRef.current);
    typingTimerRef.current = setTimeout(() => {
      isTypingRef.current = false;
      emitTyping(false);
    }, 2000);
  }, [emitTyping]);

  const onBlur = useCallback(() => {
    clearTimeout(typingTimerRef.current);
    if (isTypingRef.current) {
      isTypingRef.current = false;
      emitTyping(false);
    }
  }, [emitTyping]);

  return { onType, onBlur };
}
