# Daniel: instruções para agentes

Decodificador/assinador de JWT 100% client-side. TypeScript + Vite, sem framework, na Vercel.

## Estrutura

```
index.html              # marcação da tela
src/main.ts             # entrada: monta as abas com o exemplo inicial
src/jwt/                # núcleo puro (sem DOM, roda no Node)
  base64url.ts          #   codificação das partes
  algorithms.ts         #   alg do JWT → parâmetros da WebCrypto
  keys.ts               #   segredo / PEM / certificado / JWK / JWKS → CryptoKey
  der.ts                #   DER mínimo: PKCS#1/SEC1 → PKCS#8, certificado → SPKI
  generate.ts           #   gera segredo ou par de chaves PEM
  token.ts              #   decode, sign, verify
src/ui/                 # tela
  dom.ts                #   atalhos de DOM
  claims.ts             #   claims legíveis (puro, testado)
  decoder.ts encoder.ts #   abas Decifrar e Selar
  tabs.ts               #   troca de aba
  theme.ts              #   botão de tema claro/escuro (lembra a escolha)
  icons.ts              #   ícones Lucide (só os usados; <span data-icon> no HTML)
  fx/                   #   efeitos cyberpunk: boot, chuva, glitch de texto, tilt, veredito
                        #   (todos respeitam prefers-reduced-motion)
  transparency.ts       #   contador de rede e de bloqueios da CSP
  fonts.ts              #   Google Fonts via Fontsource (servidas pelo próprio site)
  style.css             #   visual retrô, claro e escuro
public/logo.jpg         # logo (também favicon)
public/og.jpg           # preview de link (1200×630); URL absoluta no <head> do index.html
docs/screenshot.jpg     # print da tela no README
test/*.test.ts          # node --test (chaves reais do openssl em test/fixtures/)
vercel.json             # cabeçalhos de segurança (CSP); vite.config.ts reusa no preview
.github/workflows/      # ci.yml (teste + build) e release.yml (tag v* → release)
.github/dependabot.yml  # PR semanal agrupado: npm e SHAs das actions
```

## Regras

- **Nada de rede.** Nenhum `fetch`, CDN, analytics ou recurso externo. A CSP
  `connect-src 'none'` é a promessa do projeto: não afrouxe.
- **Fonte nova:** pacote `@fontsource/*` importado em `src/ui/fonts.ts`. Nunca link do
  `fonts.googleapis.com` (seria requisição para fora).
- **Trusted Types ligado** na CSP: nada de `innerHTML`, `outerHTML`, `insertAdjacentHTML`
  ou `document.write`. Monte DOM com `createElement` + `textContent` (`el()` em `dom.ts`).
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

## Release

`npm version <patch|minor|major>` + `git push --follow-tags`. O `.npmrc` define a mensagem
(`chore: lança vX.Y.Z`); o `release.yml` recusa tag diferente da versão do `package.json`.
Actions fixadas por SHA (com a versão em comentário): ao atualizar, troque os dois.

Commits: Conventional Commits em português.
