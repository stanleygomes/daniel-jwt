// Entrada: estilos + monta as telas com o exemplo inicial.

import './ui/fonts.ts';
import './ui/style.css';
import { setupDecoder } from './ui/decoder.ts';
import { $ } from './ui/dom.ts';
import { mountIcons } from './ui/icons.ts';
import { setupEncoder, type Draft } from './ui/encoder.ts';
import { boot } from './ui/fx/boot.ts';
import { followPointer } from './ui/fx/pointer.ts';
import { startRain } from './ui/fx/rain.ts';
import { typeText } from './ui/fx/text.ts';
import { setupTabs } from './ui/tabs.ts';
import { setupTheme } from './ui/theme.ts';
import { showBuild, watchNetwork } from './ui/transparency.ts';

const SAMPLE: Draft = {
  header: { alg: 'HS256', typ: 'JWT' },
  payload: { sub: '1234567890', name: 'Belsazar', admin: true, iat: 1516239022 },
  key: 'mene-mene-tequel-ufarsim',
};

boot(__VERSION__);
mountIcons();
setupTheme();
watchNetwork();
showBuild();
setupTabs();
startRain($<HTMLCanvasElement>('rain'));
followPointer();
typeText($('motto'), $('motto').textContent ?? '');
const token = await setupEncoder(SAMPLE);
await setupDecoder(token, SAMPLE.key);
