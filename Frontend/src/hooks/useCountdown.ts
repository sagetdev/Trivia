import { useEffect, useState } from 'react';

export function useCountdown(seconds: number | null, running: boolean, resetKey: unknown, onEnd: () => void) {
  const [left, setLeft] = useState(seconds ?? 0);

  useEffect(() => {
    setLeft(seconds ?? 0);
  }, [seconds, resetKey]);

  useEffect(() => {
    if (seconds === null || !running) return;

    let remaining = seconds;
    let ended = false;

    const id = setInterval(() => {
      remaining = Math.max(0, remaining - 1);
      setLeft(remaining);

      if (remaining === 0 && !ended) {
        ended = true;
        clearInterval(id);
        // Side effects must stay outside React state updater callbacks:
        // React Strict Mode can invoke updater callbacks more than once.
        onEnd();
      }
    }, 1000);

    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seconds, running, resetKey]);

  return left;
}
