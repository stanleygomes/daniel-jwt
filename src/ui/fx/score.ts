// Placar de fliperama: pontos (1UP), recorde (HI, lembrado no navegador) e vidas.

import { $, el } from '../dom.ts';
import { reducedMotion } from './motion.ts';

const HI_KEY = 'daniel-hi';
const FULL = 3;

let score = 0;
let hi = readHi();
let lives = FULL;

function readHi(): number {
  try {
    return Number(localStorage.getItem(HI_KEY)) || 0;
  } catch {
    return 0;
  }
}

const pad = (n: number): string => String(n).padStart(6, '0');

// Texto que sobe e some em cima de um elemento ("+100", "POWER UP").
export function pop(target: HTMLElement, text: string): void {
  if (reducedMotion) return;
  const box = target.getBoundingClientRect();
  const label = el('span', text, 'pop');
  label.style.left = `${box.left + box.width / 2}px`;
  label.style.top = `${box.top}px`;
  document.body.append(label);
  label.addEventListener('animationend', () => label.remove());
}

export function addPoints(points: number, from: HTMLElement = $('hud-score')): void {
  score += points;
  $('hud-score').textContent = pad(score);
  pop(from, `+${points}`);
  if (score <= hi) return;
  hi = score;
  $('hud-hi').textContent = pad(hi);
  try {
    localStorage.setItem(HI_KEY, String(hi));
  } catch {
    // recorde vale só até recarregar
  }
}

function paintLives(): void {
  const box = $('hud-lives');
  box.ariaLabel = `${lives} vidas`;
  box.classList.toggle('out', lives === 0);
  if (lives === 0) box.replaceChildren('CONTINUE?');
  else if (lives > FULL) box.replaceChildren(el('i', '♥'), `×${lives}`);
  else box.replaceChildren(...Array.from({ length: FULL }, (_, i) => el('i', '♥', i < lives ? '' : 'lost')));
}

export function loseLife(): void {
  lives = Math.max(0, lives - 1);
  paintLives();
}

// Assinatura válida devolve as vidas (o código Konami dá 30, como no Contra).
export function setLives(count = FULL): void {
  lives = Math.max(lives, count);
  paintLives();
}

export function setupScore(): void {
  $('hud-hi').textContent = pad(hi);
  paintLives();
}
