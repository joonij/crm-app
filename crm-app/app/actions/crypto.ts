"use server";

import crypto from "crypto";

// 환경변수에서 키를 가져옵니다.
const RAW_KEY = process.env.ENCRYPTION_KEY || "260701rlawjdqkfmswltkdmltlwkr260701";

// ⭐️ 핵심 해결책: 사용자가 입력한 키의 길이가 어떻든, SHA-256 해시를 거쳐 무조건 정확한 32바이트(256비트) Buffer로 변환합니다.
const ENCRYPTION_KEY = crypto.createHash("sha256").update(RAW_KEY).digest();
const IV_LENGTH = 16;

// 🔒 암호화 함수
export async function encryptRegNumber(text: string | null) {
  if (!text) return null;
  const iv = crypto.randomBytes(IV_LENGTH);
  
  // Buffer.from(ENCRYPTION_KEY) 대신 이미 32바이트 Buffer로 변환된 ENCRYPTION_KEY를 바로 사용합니다.
  const cipher = crypto.createCipheriv("aes-256-cbc", ENCRYPTION_KEY, iv);
  
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return iv.toString("hex") + ":" + encrypted.toString("hex");
}

// 🔓 복호화 함수 (향후 상세 페이지 등에서 번호를 다시 보여줄 때 사용)
export async function decryptRegNumber(text: string | null) {
  if (!text) return null;
  try {
    const textParts = text.split(":");
    const iv = Buffer.from(textParts.shift()!, "hex");
    const encryptedText = Buffer.from(textParts.join(":"), "hex");
    
    const decipher = crypto.createDecipheriv("aes-256-cbc", ENCRYPTION_KEY, iv);
    
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
  } catch (error) {
    console.error("복호화 실패:", error);
    return null;
  }
}