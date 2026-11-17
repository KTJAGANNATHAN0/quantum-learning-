import React, { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  baseX: number;
  baseY: number;
  vx: number;
  vy: number;
  size: number;
  isRed: boolean;
  phase: number;
}

export const AmbientCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const mouse = { x: -1000, y: -1000, radius: 140 };

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      initGrid();
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };

    const handleMouseLeave = () => {
      mouse.x = -1000;
      mouse.y = -1000;
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseleave', handleMouseLeave);

    // Initialize regular technical lattice of quantum coordinate nodes
    const spacing = 75;
    let particles: Particle[] = [];

    const initGrid = () => {
      particles = [];
      const cols = Math.ceil(width / spacing) + 1;
      const rows = Math.ceil(height / spacing) + 1;

      for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
          const x = i * spacing;
          const y = j * spacing;
          // Every ~7th particle is a red quantum telemetry node
          const isRed = (i * 3 + j * 7) % 11 === 0;
          particles.push({
            x,
            y,
            baseX: x,
            baseY: y,
            vx: 0,
            vy: 0,
            size: isRed ? 2.5 : 1.5,
            isRed,
            phase: Math.random() * Math.PI * 2
          });
        }
      }
    };

    initGrid();

    let frame = 0;

    const render = () => {
      frame++;
      ctx.clearRect(0, 0, width, height);

      // Subtle millimeter graph grid
      ctx.lineWidth = 0.5;
      ctx.strokeStyle = 'rgba(226, 232, 240, 0.45)';

      // Draw horizontal & vertical rule accents
      for (let x = 0; x < width; x += spacing * 2) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += spacing * 2) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Draw & update quantum particles
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // Wave oscillation (quantum probability wave fluctuation)
        const wave = Math.sin(frame * 0.02 + p.phase) * 1.5;

        // Mouse repulsion physics
        const dx = mouse.x - p.x;
        const dy = mouse.y - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < mouse.radius && dist > 0) {
          const force = (mouse.radius - dist) / mouse.radius;
          const dirX = (dx / dist) * force * 15;
          const dirY = (dy / dist) * force * 15;
          p.x -= dirX;
          p.y -= dirY;
        } else {
          // Spring back to base position
          p.x += (p.baseX - p.x) * 0.08;
          p.y += (p.baseY + wave - p.y) * 0.08;
        }

        // Draw crosshair or node
        if (p.isRed) {
          // Precision red laboratory coordinate crosshair
          ctx.strokeStyle = 'rgba(220, 38, 38, 0.4)';
          ctx.lineWidth = 0.8;
          const arm = 4;
          ctx.beginPath();
          ctx.moveTo(p.x - arm, p.y);
          ctx.lineTo(p.x + arm, p.y);
          ctx.moveTo(p.x, p.y - arm);
          ctx.lineTo(p.x, p.y + arm);
          ctx.stroke();

          // Red micro-dot
          ctx.fillStyle = 'rgba(220, 38, 38, 0.7)';
          ctx.beginPath();
          ctx.arc(p.x, p.y, 1.2, 0, Math.PI * 2);
          ctx.fill();
        } else {
          // Slate coordinate dot
          ctx.fillStyle = 'rgba(148, 163, 184, 0.35)';
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        pointerEvents: 'none',
        zIndex: 0,
        opacity: 0.85
      }}
    />
  );
};
