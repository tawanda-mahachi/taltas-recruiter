// @ts-nocheck
'use client';

import { useEffect, useRef } from 'react';

export function NetworkCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const c = ref.current;
    if (!c) return;
    const ctx = c.getContext('2d')!;
    let raf: number;

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      c.width = c.offsetWidth * dpr;
      c.height = c.offsetHeight * dpr;
      ctx.scale(dpr, dpr);
    };
    resize();

    const W = c.offsetWidth;
    const H = c.offsetHeight;
    const count = Math.min(80, Math.floor((W * H) / 10000));
    /* Match landing page indigo palette + 25% visibility boost */
    const nodeColors = ['rgba(55,48,163,0.69)', 'rgba(67,56,202,0.69)', 'rgba(49,46,129,0.69)', 'rgba(79,70,229,0.63)'];
    const nodes = Array.from({ length: count }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      vx: (Math.random() - 0.5) * 0.35,
      vy: (Math.random() - 0.5) * 0.35,
      r: 1.5 + Math.random() * 2.5,
      color: nodeColors[Math.floor(Math.random() * nodeColors.length)],
    }));

    const draw = () => {
      ctx.clearRect(0, 0, W, H);

      // Connections — indigo, matching landing page at 125%
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 150) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(55,48,163,${(1 - dist / 140) * 0.40})`;
            ctx.lineWidth = 0.6;
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.stroke();
          }
        }
      }

      // Nodes
      for (const n of nodes) {
        n.x += n.vx;
        n.y += n.vy;
        if (n.x < 0 || n.x > W) n.vx *= -1;
        if (n.y < 0 || n.y > H) n.vy *= -1;
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        ctx.fillStyle = n.color;
        ctx.fill();
      }

      raf = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <canvas
      ref={ref}
      className="absolute inset-0 w-full h-full pointer-events-none"
    />
  );
}

