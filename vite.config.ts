import { defineConfig } from 'vite';
import vercel from './vercel.json' with { type: 'json' };

// `npm run preview` usa os mesmos cabeçalhos (CSP) da produção.
const headers = Object.fromEntries(vercel.headers[0].headers.map(({ key, value }) => [key, value]));

export default defineConfig({ preview: { headers } });
