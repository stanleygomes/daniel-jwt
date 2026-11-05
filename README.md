# 📜 Daniel

Decodifique, verifique e assine JWT direto no navegador. Nada sai da sua máquina.

> "Os teus presentes fiquem contigo; todavia lerei ao rei a escritura." (Daniel 5:17)

![Daniel](public/logo.jpg)

## Por que confiar

Não confie: confira. A criptografia inteira cabe em [`src/jwt/`](src/jwt) (~150 linhas).

- **Sem rede.** A CSP de [`vercel.json`](vercel.json) tem `connect-src 'none'`: o navegador não envia nada.
- **Sem servidor.** Assinatura e verificação usam a WebCrypto nativa.
- **Sem rastreio.** Nada de cookie, analytics, CDN ou script de terceiros. As fontes (Bungee, Old Standard TT, Courier Prime) são servidas pelo próprio site.
- **Ao vivo.** A tela conta as requisições para fora e os bloqueios da CSP. Ou abra o DevTools.

## Funciona com

| Família | Algoritmos | Chave |
| --- | --- | --- |
| HMAC | HS256, HS384, HS512 | segredo |
| RSA | RS256…512, PS256…512 | PEM (PKCS#8/SPKI) ou JWK |
| ECDSA | ES256, ES384, ES512 | PEM (PKCS#8/SPKI) ou JWK |
| EdDSA | Ed25519 | PEM (PKCS#8/SPKI) ou JWK |

## Rodar

Node 24+.

```bash
npm install
npm run dev       # desenvolvimento
npm test          # testes (node --test, TypeScript direto)
npm run build     # tsc + vite build → dist/
npm run preview   # serve o dist/ com a mesma CSP da produção
```

## Deploy

Vercel: importe o repo. O preset Vite é detectado sozinho; o `vercel.json` só adiciona os cabeçalhos de segurança.

## Licença

[MIT](LICENSE)
