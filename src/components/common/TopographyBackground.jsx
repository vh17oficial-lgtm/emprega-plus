import { useEffect, useRef } from 'react';

export default function TopographyBackground({
  className = '',
  children,
  lineCount = 18,
  lineColor = 'rgba(99, 130, 255, 0.12)',
  backgroundColor = '#0c1122',
  speed = 0.6,
  strokeWidth = 0.8,
  overlay = true,
}) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    let width, height, animationId, tick = 0;

    const resize = () => {
      const rect = container.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(container);

    const getHeight = (x, t) => {
      const s = 0.003;
      return (
        Math.sin(x * s * 2 + t) * 30 +
        Math.sin(x * s * 3.7 + t * 0.7) * 20 +
        Math.sin(x * s * 1.3 - t * 0.5) * 40 +
        Math.sin(x * s * 5.1 + t * 1.2) * 10 +
        Math.sin(x * s * 0.7 + t * 0.3) * 50
      );
    };

    const animate = () => {
      tick += 0.008 * speed;
      ctx.fillStyle = backgroundColor;
      ctx.fillRect(0, 0, width, height);

      ctx.strokeStyle = lineColor;
      ctx.lineWidth = strokeWidth;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      const spacing = height / (lineCount - 1);
      const pad = 50;

      for (let i = 0; i < lineCount; i++) {
        const baseY = spacing * i;
        ctx.beginPath();
        let started = false;
        for (let x = -pad; x <= width + pad; x += 3) {
          const y = baseY + getHeight(x + i * 100, tick);
          if (!started) { ctx.moveTo(x, y); started = true; }
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }

      animationId = requestAnimationFrame(animate);
    };

    animationId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationId);
      ro.disconnect();
    };
  }, [lineCount, lineColor, backgroundColor, speed, strokeWidth]);

  return (
    <div
      ref={containerRef}
      className={`fixed inset-0 overflow-hidden ${className}`}
      style={{ backgroundColor, zIndex: 0 }}
    >
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />

      {overlay && (
        <>
          <div
            className="pointer-events-none absolute inset-0 opacity-50"
            style={{ background: `radial-gradient(ellipse at 50% 50%, transparent 0%, ${backgroundColor} 100%)` }}
          />
          <div
            className="pointer-events-none absolute inset-0"
            style={{ background: `radial-gradient(ellipse at center, transparent 0%, transparent 40%, ${backgroundColor} 100%)` }}
          />
        </>
      )}

      {children && <div className="relative z-10 h-full w-full">{children}</div>}
    </div>
  );
}
