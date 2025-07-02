import { writeFileSync, mkdirSync } from 'fs';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';

const thisDir = dirname(fileURLToPath(import.meta.url));

const target = resolve(thisDir, '..', 'src', 'environments', 'environment.ts');

mkdirSync(dirname(target), { recursive: true });

const { SUPABASE_URL, SUPABASE_KEY, NODE_ENV } = process.env;
if (!SUPABASE_URL || !SUPABASE_KEY) {
    throw new Error(
        '❌  SUPABASE_URL and SUPABASE_KEY must be set (shell, .env, or CI)'
    );
}

const fileContents = `// ⚠️ AUTO-GENERATED — DO NOT EDIT
export const environment = {
  production: ${NODE_ENV === 'production'},
  supabaseUrl: '${SUPABASE_URL}',
  supabaseKey: '${SUPABASE_KEY}'
} as const;
`;

writeFileSync(target, fileContents, { encoding: 'utf-8' });
console.log(`✅  Generated ${target}`);
