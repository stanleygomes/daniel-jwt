// Entrada: estilos + monta as telas com o exemplo inicial.

import './ui/fonts.ts';
import './ui/style.css';
import { setupDecoder } from './ui/decoder.ts';
import { setupEncoder, type Draft } from './ui/encoder.ts';
import { setupTabs } from './ui/tabs.ts';
import { watchNetwork } from './ui/transparency.ts';

const SAMPLE: Draft = {
  header: { alg: 'HS256', typ: 'JWT' },
  payload: { sub: '1234567890', name: 'Belsazar', admin: true, iat: 1516239022 },
  key: 'mene-mene-tequel-ufarsim',
};

watchNetwork();
setupTabs();
const token = await setupEncoder(SAMPLE);
await setupDecoder(token, SAMPLE.key);
