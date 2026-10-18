import { useEffect, useState } from 'react';

export function useCountdown(seconds: number | null, running: boolean, resetKey: unknown, onEnd: () => void) {
  const [left, setLeft] = useState(seconds ?? 0);

  useEffect(() => {
    setLeft(seconds ?? 0);
  }, [seconds, resetKey]);

  useEffect(() => {
    if (seconds === null || !running) return;
    const id = setInterval(() => {
      setLeft((prev) => {
        if (prev <= 1) {
          clearInterval(id);
          onEnd();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seconds, running, resetKey]);

  return left;
}
