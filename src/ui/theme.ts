// Botão de tema: alterna claro/escuro e lembra a escolha neste navegador.

import { $ } from './dom.ts';
import { icon, type IconName } from './icons.ts';

type Theme = 'light' | 'dark';

const KEY = 'daniel-theme';
const NEXT: Record<Theme, { icon: IconName; label: string }> = {
  light: { icon: 'moon', label: 'Mudar para o tema escuro' },
  dark: { icon: 'sun', label: 'Mudar para o tema claro' },
};

// localStorage pode não existir (aba privada, site bloqueado): aí só não lembra.
function stored(): Theme | null {
  try {
    const value = localStorage.getItem(KEY);
    return value === 'light' || value === 'dark' ? value : null;
  } catch {
    return null;
  }
}

function save(theme: Theme): void {
  try {
    localStorage.setItem(KEY, theme);
  } catch {
    // sem armazenamento, o tema vale só até recarregar
  }
}

const systemTheme = (): Theme => (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');

function apply(theme: Theme): void {
  document.documentElement.dataset.theme = theme;
  const button = $('theme');
  button.replaceChildren(icon(NEXT[theme].icon, 26));
  button.title = button.ariaLabel = NEXT[theme].label;
}

export function setupTheme(): void {
  let theme = stored() ?? systemTheme();
  apply(theme);
  $('theme').addEventListener('click', () => {
    theme = theme === 'dark' ? 'light' : 'dark';
    apply(theme);
    save(theme);
  });
}
