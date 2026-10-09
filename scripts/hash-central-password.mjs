import { randomBytes, pbkdf2Sync } from "node:crypto";

const password = process.argv[2];
if (!password || password.length < 12 || password.length > 128) {
  console.error("Use uma senha de 12 a 128 caracteres.");
  process.exit(1);
}
const salt = randomBytes(16);
// Cloudflare Workers WebCrypto accepts PBKDF2 iteration counts up to 100,000.
const derived = pbkdf2Sync(password, salt, 100000, 32, "sha256");
const encode = (value) => value.toString("base64url");
console.log(`pbkdf2$sha256$100000$${encode(salt)}$${encode(derived)}`);
