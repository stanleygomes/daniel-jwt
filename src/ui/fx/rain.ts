// Chuva de caracteres base64url (o alfabeto do JWT) num canvas de fundo.

import { randomGlyph, reducedMotion } from './motion.ts';

const SIZE = 16;
const FRAME_MS = 55;
const COLORS = ['#ff2bd6', '#00f0ff', '#f5ff3b'];

export function startRain(canvas: HTMLCanvasElement): void {
  const ctx = canvas.getContext('2d');
  if (!ctx || reducedMotion) return;
  let drops: number[] = [];
  const resize = (): void => {
    canvas.width = innerWidth;
    canvas.height = innerHeight;
    drops = Array.from({ length: Math.ceil(canvas.width / SIZE) }, () => Math.random() * -60);
  };
  resize();
  addEventListener('resize', resize);

  let last = 0;
  const frame = (time: number): void => {
    requestAnimationFrame(frame);
    if (time - last < FRAME_MS) return;
    last = time;
    // apaga aos poucos (rastro) sem pintar fundo: funciona no tema claro e no escuro
    ctx.globalCompositeOperation = 'destination-out';
    ctx.fillStyle = 'rgb(0 0 0 / 0.14)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.globalCompositeOperation = 'source-over';
    ctx.font = `${SIZE}px 'Share Tech Mono', monospace`;
    drops.forEach((row, column) => {
      ctx.fillStyle = COLORS[column % COLORS.length];
      ctx.fillText(randomGlyph(), column * SIZE, row * SIZE);
      drops[column] = row * SIZE > canvas.height && Math.random() > 0.97 ? 0 : row + 1;
    });
  };
  requestAnimationFrame(frame);
}
