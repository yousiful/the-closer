// EmberField — floating amber ember particles for the background
// Design: Premium SaaS / Dark Intelligence theme

import { useEffect, useRef } from "react";

interface Ember {
  x: number;
  y: number;
  size: number;
  speed: number;
  opacity: number;
  drift: number;
  life: number;
  maxLife: number;
}

export default function EmberField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const embersRef = useRef<Ember[]>([]);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    // Initialize embers
    const spawnEmber = (): Ember => ({
      x: Math.random() * canvas.width,
      y: canvas.height + 10,
      size: Math.random() * 2.5 + 0.5,
      speed: Math.random() * 0.8 + 0.3,
      opacity: Math.random() * 0.6 + 0.2,
      drift: (Math.random() - 0.5) * 0.4,
      life: 0,
      maxLife: Math.random() * 200 + 150,
    });

    for (let i = 0; i < 40; i++) {
      const e = spawnEmber();
      e.y = Math.random() * canvas.height; // scatter initial positions
      e.life = Math.random() * e.maxLife;
      embersRef.current.push(e);
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      embersRef.current.forEach((ember, i) => {
        ember.life++;
        ember.y -= ember.speed;
        ember.x += ember.drift;

        const progress = ember.life / ember.maxLife;
        const alpha = ember.opacity * (1 - progress);

        // Draw ember glow
        const gradient = ctx.createRadialGradient(
          ember.x, ember.y, 0,
          ember.x, ember.y, ember.size * 3
        );
        gradient.addColorStop(0, `rgba(245, 158, 11, ${alpha})`);
        gradient.addColorStop(0.4, `rgba(212, 160, 23, ${alpha * 0.6})`);
        gradient.addColorStop(1, `rgba(212, 160, 23, 0)`);

        ctx.beginPath();
        ctx.arc(ember.x, ember.y, ember.size * 3, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();

        // Core dot
        ctx.beginPath();
        ctx.arc(ember.x, ember.y, ember.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 200, 80, ${alpha})`;
        ctx.fill();

        if (ember.life >= ember.maxLife) {
          embersRef.current[i] = spawnEmber();
        }
      });

      rafRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ opacity: 0.4 }}
    />
  );
}
