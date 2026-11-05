# 📜 Daniel

Decodifique, verifique e assine JWT direto no navegador. Nada sai da sua máquina.

> "Os teus presentes fiquem contigo; todavia lerei ao rei a escritura." (Daniel 5:17)

![Daniel](public/logo.jpg)

## Por que confiar

Não confie: confira. O site inteiro são 4 arquivos em [`public/`](public), sem build e sem dependência.

- **Sem rede.** A CSP (`connect-src 'none'`, em [`vercel.json`](vercel.json) e no `<meta>`) proíbe o navegador de enviar qualquer coisa.
- **Sem servidor.** Assinatura e verificação usam a WebCrypto nativa ([`jwt.js`](public/jwt.js)).
- **Sem rastreio.** Nada de cookie, analytics, fonte ou script de terceiros.
- **Ao vivo.** A tela conta as requisições para fora e os bloqueios da CSP. Ou abra o DevTools.

## Funciona com

| Família | Algoritmos | Chave |
| --- | --- | --- |
| HMAC | HS256, HS384, HS512 | segredo |
| RSA | RS256…512, PS256…512 | PEM (PKCS#8/SPKI) ou JWK |
| ECDSA | ES256, ES384, ES512 | PEM (PKCS#8/SPKI) ou JWK |
| EdDSA | Ed25519 | PEM (PKCS#8/SPKI) ou JWK |

## Rodar local / offline

```bash
npm start   # http://localhost:8000 (python3 -m http.server)
npm test    # node --test, sem dependência
```

## Deploy

Vercel, sem framework: importe o repo e pronto. O `vercel.json` aponta para `public/` e define os cabeçalhos de segurança.

## Licença

[MIT](LICENSE)
