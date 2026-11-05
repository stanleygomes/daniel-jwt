Chaves de **teste** (não use em nada real), geradas com:

```bash
openssl genrsa -traditional -out rsa-pkcs1.pem 2048
openssl rsa -in rsa-pkcs1.pem -RSAPublicKey_out -out rsa-pkcs1-pub.pem
openssl req -new -x509 -key rsa-pkcs1.pem -out rsa-cert.pem -days 36500 -subj "/CN=daniel-jwt test"
openssl ecparam -name prime256v1 -genkey -out ec-sec1.pem          # com EC PARAMETERS
openssl ecparam -name secp384r1 -genkey -noout -out ec384-sec1.pem  # sem
openssl pkcs8 -topk8 -nocrypt -in rsa-pkcs1.pem -out rsa-pkcs8.pem   # referência do DER
openssl rsa -in rsa-pkcs1.pem -pubout -out rsa-spki.pem
openssl req -new -x509 -key ec-sec1.pem -out ec-cert.pem -days 36500 -subj "/CN=daniel-jwt test"
```
