import { SignJWT, jwtVerify } from 'jose';
import { NextRequest } from 'next/server';

const secretKey = process.env.APP_KEY || 'default_secret_key_please_change';
const key = new TextEncoder().encode(secretKey);

export async function createToken(userId: number): Promise<string> {
  return await new SignJWT({ sub: String(userId) })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('30d')
    .sign(key);
}

export async function verifyToken(token: string): Promise<any> {
  try {
    const { payload } = await jwtVerify(token, key);
    return payload;
  } catch (error) {
    return null;
  }
}

export async function getAuthUser(req: NextRequest): Promise<number | null> {
  const authHeader = req.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) return null;

  const token = authHeader.split(' ')[1];
  const payload = await verifyToken(token);
  
  if (!payload || !payload.sub) return null;
  return Number(payload.sub);
}
