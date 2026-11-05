// Mouse: holofote que segue o cursor e painéis [data-tilt] que inclinam (holograma).

import { reducedMotion } from './motion.ts';

const MAX_TILT = 5;

export function followPointer(): void {
  if (reducedMotion) return;
  const root = document.documentElement;
  addEventListener('pointermove', (event) => {
    root.style.setProperty('--mx', `${event.clientX}px`);
    root.style.setProperty('--my', `${event.clientY}px`);
  });

  for (const panel of document.querySelectorAll<HTMLElement>('[data-tilt]')) {
    panel.addEventListener('pointermove', (event) => {
      const box = panel.getBoundingClientRect();
      const x = (event.clientX - box.left) / box.width - 0.5;
      const y = (event.clientY - box.top) / box.height - 0.5;
      panel.style.transform = `perspective(900px) rotateX(${-y * MAX_TILT}deg) rotateY(${x * MAX_TILT}deg)`;
    });
    panel.addEventListener('pointerleave', () => (panel.style.transform = ''));
  }
}
