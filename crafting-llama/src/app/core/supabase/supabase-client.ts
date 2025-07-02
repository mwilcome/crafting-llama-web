import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '@env/environment';

export const supabase: SupabaseClient = createClient(
    environment.supabaseUrl,
    environment.supabaseKey
);