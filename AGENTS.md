# Daniel: instruções para agentes

Decodificador/assinador de JWT 100% client-side. Site estático na Vercel.

## Estrutura

```
public/index.html   # tela (CSP também no <meta>)
public/style.css    # visual retrô (papel, tinta, bordas duplas), claro e escuro
public/app.js       # DOM: liga os campos ao jwt.js e conta a rede
public/jwt.js       # núcleo puro: base64url, decode, sign, verify (WebCrypto)
test/jwt.test.js    # node --test
vercel.json         # outputDirectory public + cabeçalhos de segurança
```

## Regras

- **Nada de rede.** Nenhum `fetch`, CDN, fonte web, analytics ou script externo. A CSP
  `connect-src 'none'` é a promessa do projeto: não afrouxe.
- **Zero dependência e zero build.** Só ES modules nativos. Node só roda os testes.
- `jwt.js` não toca no DOM (roda no Node); `app.js` não faz criptografia.
- Arquivo novo em `public/`? Liste no painel de transparência do `index.html` e no README.
- Algoritmo novo: entrada em `ALGS` (`jwt.js`) + teste de ida e volta.
- Mudou CSP? Mude nos dois lugares: `vercel.json` e `<meta>` do `index.html`.

## Comandos

```bash
npm test    # obrigatório antes de commitar
npm start   # http://localhost:8000
```

Commits: Conventional Commits em português.
