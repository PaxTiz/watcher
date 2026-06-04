import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";

type TokenType = "access_token" | "refresh_token";

const ALGORITHM = "aes-256-gcm";
const CIPHER_SIZE = 12;

export const encrypt = (type: TokenType, raw: string) => {
  const key = Buffer.from(useRuntimeConfig().encryption.credentials[type], "hex");

  const iv = randomBytes(CIPHER_SIZE);
  const cipher = createCipheriv(ALGORITHM, key, iv);

  const encrypted = Buffer.concat([cipher.update(raw), cipher.final()]);
  const tag = cipher.getAuthTag();

  return Buffer.concat([iv, tag, encrypted]).toString("base64");
};

export const decrypt = (type: TokenType, data: string) => {
  const key = Buffer.from(useRuntimeConfig().encryption.credentials[type], "hex");

  const buffer = Buffer.from(data, "base64");
  const iv = buffer.subarray(0, CIPHER_SIZE);
  const tag = buffer.subarray(CIPHER_SIZE, 28);
  const encrypted = buffer.subarray(28);

  const decipher = createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(tag);

  return Buffer.concat([decipher.update(encrypted), decipher.final()]).toString("utf-8");
};
