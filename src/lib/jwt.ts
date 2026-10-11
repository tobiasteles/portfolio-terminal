// Seguro para o runtime Edge (usado pelo middleware): não importa next/headers.
import { jwtVerify, SignJWT } from "jose";

export const COOKIE_NAME = "admin_session";
export const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 dias

export type SessionPayload = { userId: number; email: string };

function getKey() {
  const secret = process.env.AUTH_SECRET;
  if (!secret || secret.length < 16) {
    throw new Error("AUTH_SECRET ausente ou curto demais (mínimo 16 caracteres).");
  }
  return new TextEncoder().encode(secret);
}

export async function signToken({ userId, email }: SessionPayload) {
  return new SignJWT({ email })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(String(userId))
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(getKey());
}

export async function verifyToken(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getKey(), { algorithms: ["HS256"] });
    if (!payload.sub || typeof payload.email !== "string") return null;
    return { userId: Number(payload.sub), email: payload.email };
  } catch {
    return null;
  }
}
