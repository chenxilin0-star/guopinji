import { SignJWT, jwtVerify } from 'jose';
import type { JWTPayload } from '../types';

export async function createToken(payload: Omit<JWTPayload, 'iat' | 'exp'>, secret: string): Promise<string> {
  const secretKey = new TextEncoder().encode(secret);
  return new SignJWT({ userId: payload.userId, email: payload.email })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(secretKey);
}

export async function verifyToken(token: string, secret: string): Promise<JWTPayload> {
  const secretKey = new TextEncoder().encode(secret);
  const { payload } = await jwtVerify(token, secretKey, {
    clockTolerance: 60,
  });
  return payload as unknown as JWTPayload;
}
