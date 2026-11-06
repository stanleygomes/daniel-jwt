// Entrada: estilos + monta as telas com o exemplo inicial.

import './ui/fonts.ts';
import './ui/style.css';
import { setupDecoder } from './ui/decoder.ts';
import { $ } from './ui/dom.ts';
import { type Draft, setupEncoder } from './ui/encoder.ts';
import { boot } from './ui/fx/boot.ts';
import { listenKonami } from './ui/fx/konami.ts';
import { flap } from './ui/fx/text.ts';
import { mountIcons } from './ui/icons.ts';
import { setupTabs } from './ui/tabs.ts';
import { setupTheme } from './ui/theme.ts';
import { showBuild, watchNetwork } from './ui/transparency.ts';

const NOW = Math.floor(Date.now() / 1000);
const SAMPLE: Draft = {
  header: { alg: 'HS256', typ: 'JWT' },
  // Emitido há 45 min, vale 1 h: a barra de vida já começa no fim (Dn 5:30, "naquela mesma noite").
  payload: { sub: '1234567890', name: 'Belsazar', admin: true, iat: NOW - 45 * 60, exp: NOW + 15 * 60 },
  key: 'mene-mene-tequel-ufarsim',
};

setupTheme(); // antes de tudo: a página só aparece com o tema definido
boot(__VERSION__);
mountIcons();
watchNetwork();
showBuild();
setupTabs();
flap($('motto'), $('motto').textContent ?? '', 60);
listenKonami();
const token = await setupEncoder(SAMPLE);
await setupDecoder(token, SAMPLE.key);
