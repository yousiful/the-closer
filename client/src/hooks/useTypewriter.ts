import { useState, useEffect, useRef } from "react";

export function useTypewriter(text: string, speed = 18, active = false) {
  const [displayed, setDisplayed] = useState("");
  const [done, setDone] = useState(false);
  const indexRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!active || !text) return;
    setDisplayed("");
    setDone(false);
    indexRef.current = 0;

    const tick = () => {
      if (indexRef.current < text.length) {
        setDisplayed(text.slice(0, indexRef.current + 1));
        indexRef.current++;
        timerRef.current = setTimeout(tick, speed);
      } else {
        setDone(true);
      }
    };

    timerRef.current = setTimeout(tick, speed);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [text, speed, active]);

  return { displayed, done };
}
