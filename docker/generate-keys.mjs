// Script to generate secure random JWT_SECRET, anon key, and service_role key for Supabase
import crypto from 'node:crypto';

function base64url(input) {
  return Buffer.from(input)
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

function signJwt(payload, secret) {
  const header = { alg: 'HS256', typ: 'JWT' };
  const encodedHeader = base64url(JSON.stringify(header));
  const encodedPayload = base64url(JSON.stringify(payload));
  const signature = crypto
    .createHmac('sha256', secret)
    .update(`${encodedHeader}.${encodedPayload}`)
    .digest('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
  return `${encodedHeader}.${encodedPayload}.${signature}`;
}

const jwtSecret = crypto.randomBytes(32).toString('hex');
const postgresPassword = crypto.randomBytes(16).toString('hex');

const now = Math.floor(Date.now() / 1000);
const exp = now + 10 * 365 * 24 * 60 * 60; // 10 years

const anonKey = signJwt({ role: 'anon', iss: 'supabase', iat: now, exp }, jwtSecret);
const serviceRoleKey = signJwt({ role: 'service_role', iss: 'supabase', iat: now, exp }, jwtSecret);

console.log('\n=== CHAVES GERADAS PARA O SEU .env ===\n');
console.log(`POSTGRES_PASSWORD=${postgresPassword}`);
console.log(`JWT_SECRET=${jwtSecret}`);
console.log(`SUPABASE_ANON_KEY=${anonKey}`);
console.log(`SUPABASE_SERVICE_ROLE_KEY=${serviceRoleKey}`);
console.log('\nCopie essas variáveis para o seu arquivo .env no servidor!\n');
