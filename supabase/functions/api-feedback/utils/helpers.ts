
import { corsHeaders } from './cors.ts';

export function createErrorResponse(message: string, status = 400) {
  console.error('API Error:', message);
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

export const generateRandomScore = (): number => {
  return Math.floor(Math.random() * 5) + 1;
};
