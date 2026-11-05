// Botão de tema: alterna claro/escuro e lembra a escolha neste navegador.

import { $ } from './dom.ts';

type Theme = 'light' | 'dark';

const KEY = 'daniel-theme';
const NEXT: Record<Theme, { icon: string; label: string }> = {
  light: { icon: '☾', label: 'Mudar para o tema escuro' },
  dark: { icon: '☀', label: 'Mudar para o tema claro' },
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
  button.textContent = NEXT[theme].icon;
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
