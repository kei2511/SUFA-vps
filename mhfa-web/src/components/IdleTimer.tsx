"use client";

import { useEffect, useRef } from "react";

interface IdleTimerProps {
  timeoutMs?: number; // default to 10 mins (600,000 ms)
  onIdle: () => void;
}

export default function IdleTimer({ timeoutMs = 600000, onIdle }: IdleTimerProps) {
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const resetTimer = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      onIdle();
    }, timeoutMs);
  };

  useEffect(() => {
    const events = ["mousedown", "mousemove", "keypress", "scroll", "touchstart"];
    
    const handleActivity = () => resetTimer();

    events.forEach((event) => {
      window.addEventListener(event, handleActivity);
    });

    resetTimer();

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      events.forEach((event) => {
        window.removeEventListener(event, handleActivity);
      });
    };
  }, [timeoutMs, onIdle]);

  return null;
}
