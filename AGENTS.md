# Daniel: instruções para agentes

Decodificador/assinador de JWT 100% client-side. TypeScript + Vite, sem framework, na Vercel.

## Estrutura

```
index.html              # marcação da tela
src/main.ts             # entrada: monta as abas com o exemplo inicial
src/jwt/                # núcleo puro (sem DOM, roda no Node)
  base64url.ts          #   codificação das partes
  algorithms.ts         #   alg do JWT → parâmetros da WebCrypto
  keys.ts               #   segredo / PEM / JWK → CryptoKey
  token.ts              #   decode, sign, verify
src/ui/                 # tela
  dom.ts                #   atalhos de DOM
  claims.ts             #   claims legíveis (puro, testado)
  decoder.ts encoder.ts #   abas Decifrar e Selar
  tabs.ts               #   troca de aba
  theme.ts              #   botão de tema claro/escuro (lembra a escolha)
  transparency.ts       #   contador de rede e de bloqueios da CSP
  fonts.ts              #   Google Fonts via Fontsource (servidas pelo próprio site)
  style.css             #   visual retrô, claro e escuro
public/logo.jpg         # logo (também favicon)
test/*.test.ts          # node --test
vercel.json             # cabeçalhos de segurança (CSP); vite.config.ts reusa no preview
```

## Regras

- **Nada de rede.** Nenhum `fetch`, CDN, analytics ou recurso externo. A CSP
  `connect-src 'none'` é a promessa do projeto: não afrouxe.
- **Fonte nova:** pacote `@fontsource/*` importado em `src/ui/fonts.ts`. Nunca link do
  `fonts.googleapis.com` (seria requisição para fora).
- **Dependência só de build.** O JS gerado não importa nada de terceiros.
- `src/jwt/` não toca no DOM; `src/ui/` não faz criptografia.
- TypeScript só com sintaxe apagável (`erasableSyntaxOnly`): os testes rodam o `.ts` direto no Node.
- Imports relativos com extensão `.ts`.
- Algoritmo novo: entrada em `ALGS` + teste de ida e volta em `test/jwt.test.ts`.

## Comandos

```bash
npm run build && npm test   # obrigatório antes de commitar
npm run preview             # confira a tela com a CSP de produção
```

Commits: Conventional Commits em português.
