// Conquistas de video game: um aviso no canto na primeira vez que algo acontece.
// Lembradas neste navegador (localStorage); sem armazenamento, só não lembra.

import { $, el } from '../dom.ts';

const ACHIEVEMENTS = {
  seal: ['Primeiro selo', 'Assinou um token com as próprias mãos.'],
  rival: ['Selo de outro reino', 'Conferiu uma assinatura com chave pública.'],
  tequel: ['Tequel', 'Pesou um token e achou em falta.'],
  none: ['Sem selo, sem conversa', 'Pegou um token com alg "none".'],
  expired: ['Mene', 'Contou os dias de um token vencido.'],
  forge: ['Ferreiro', 'Forjou uma chave nova.'],
  copy: ['Mensageiro', 'Copiou um token selado.'],
  night: ['Turno da noite', 'Desceu para a estação escura.'],
  konami: ['↑↑↓↓←→←→BA', 'Achou a cifra de Jeremias.'],
} as const;

export type Achievement = keyof typeof ACHIEVEMENTS;

const KEY = 'daniel-achievements';
const TOAST_MS = 4000;

function load(): Set<string> {
  try {
    return new Set(JSON.parse(localStorage.getItem(KEY) ?? '[]'));
  } catch {
    return new Set();
  }
}

const unlocked = load();

export function unlock(id: Achievement): void {
  if (unlocked.has(id)) return;
  unlocked.add(id);
  try {
    localStorage.setItem(KEY, JSON.stringify([...unlocked]));
  } catch {
    // vale só até recarregar
  }
  const [title, text] = ACHIEVEMENTS[id];
  const total = Object.keys(ACHIEVEMENTS).length;
  const toast = el('div', '', 'toast');
  toast.append(
    el('p', `Conquista ${unlocked.size}/${total}`, 'toast-kicker'),
    el('p', title, 'toast-title'),
    el('p', text),
  );
  $('toasts').append(toast);
  setTimeout(() => toast.remove(), TOAST_MS);
}
