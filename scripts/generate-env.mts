import { writeFileSync, mkdirSync } from 'fs';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';

const thisDir = dirname(fileURLToPath(import.meta.url));
const target = resolve(thisDir, '..', 'src', 'environments', 'environment.ts');

mkdirSync(dirname(target), { recursive: true });

const {
    SUPABASE_URL,
    SUPABASE_KEY,
    SUPABASE_SERVICE_ROLE_KEY,
    RESEND_API_KEY,
    NODE_ENV
} = process.env;

const missing = [
    !SUPABASE_URL && 'SUPABASE_URL',
    !SUPABASE_KEY && 'SUPABASE_KEY',
    !SUPABASE_SERVICE_ROLE_KEY && 'SUPABASE_SERVICE_ROLE_KEY',
    !RESEND_API_KEY && 'RESEND_API_KEY',
].filter(Boolean);

if (missing.length) {
    throw new Error(`❌ Missing env vars: ${missing.join(', ')}`);
}

const fileContents = `// ⚠️ AUTO-GENERATED — DO NOT EDIT
export const environment = {
  production: ${NODE_ENV === 'production'},
  supabaseUrl: '${SUPABASE_URL}',
  supabaseKey: '${SUPABASE_KEY}',
  serviceRoleKey: '${SUPABASE_SERVICE_ROLE_KEY}',
  resendApiKey: '${RESEND_API_KEY}'
} as const;
`;

writeFileSync(target, fileContents, { encoding: 'utf-8' });
console.log(`✅ Generated ${target}`);
