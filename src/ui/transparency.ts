// Painel de transparência: conta, ao vivo, requisições para fora e bloqueios da CSP.

import { $ } from './dom.ts';

export function watchNetwork(): void {
  let external = 0;
  let blocked = 0;
  new PerformanceObserver((list) => {
    external += list.getEntries().filter((entry) => !entry.name.startsWith(location.origin)).length;
    $('t-requests').textContent = String(external);
  }).observe({ type: 'resource', buffered: true });
  document.addEventListener('securitypolicyviolation', () => {
    $('t-blocked').textContent = String(++blocked);
  });
}

// Rodapé: versão e commit deste build, com link para o código exato.
export function showBuild(): void {
  const link = $<HTMLAnchorElement>('build');
  link.textContent = `v${__VERSION__} · commit ${__COMMIT__.slice(0, 7)}`;
  if (__COMMIT__ !== 'dev') {
    link.href = `https://github.com/stanleygomes/daniel-jwt/tree/${__COMMIT__}`;
  }
}
