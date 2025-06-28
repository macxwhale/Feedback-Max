
import { createHmac } from 'https://deno.land/std@0.168.0/node/crypto.ts';

export function verifySignature(body: string, signature: string, secret: string): boolean {
  const expectedSignature = createHmac('sha256', secret)
    .update(body)
    .digest('hex');
  
  // Compare without timing attacks
  let result = 0;
  for (let i = 0; i < expectedSignature.length; i++) {
    result |= expectedSignature.charCodeAt(i) ^ signature.charCodeAt(i);
  }
  return result === 0 && expectedSignature.length === signature.length;
}
