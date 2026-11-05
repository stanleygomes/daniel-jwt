import { execSync } from 'node:child_process';
import { defineConfig } from 'vite';
import pkg from './package.json' with { type: 'json' };
import vercel from './vercel.json' with { type: 'json' };

// `npm run preview` usa os mesmos cabeçalhos (CSP) da produção.
const headers = Object.fromEntries(vercel.headers[0].headers.map(({ key, value }) => [key, value]));

// Versão e commit vão para o rodapé: dá para conferir o que está no ar.
const commit = process.env.VERCEL_GIT_COMMIT_SHA ?? process.env.GITHUB_SHA ?? gitHead();

function gitHead(): string {
  try {
    return execSync('git rev-parse HEAD').toString().trim();
  } catch {
    return 'dev';
  }
}

export default defineConfig({
  define: {
    __VERSION__: JSON.stringify(pkg.version),
    __COMMIT__: JSON.stringify(commit),
  },
  preview: { headers },
  // Sem data: URI: tudo vira arquivo servido pelo próprio domínio, como a CSP exige.
  build: { assetsInlineLimit: 0 },
});
