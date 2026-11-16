import { pbkdf2Sync, randomBytes } from "node:crypto";

const password = process.argv[2] ?? randomBytes(12).toString("base64url");
const salt = randomBytes(16);
const hash = pbkdf2Sync(password, salt, 100000, 32, "sha256");
const encoded = `pbkdf2$100000$${salt.toString("base64")}$${hash.toString("base64")}`;

console.log(`PASSWORD=${password}`);
console.log(`ADMIN_PASSWORD_HASH=${encoded}`);
