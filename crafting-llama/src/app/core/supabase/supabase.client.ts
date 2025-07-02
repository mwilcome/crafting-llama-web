import { InjectionToken } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '@env/environment';

/**
 * Single, app-wide Supabase client.
 * Angular DI will call the `factory` once and cache the instance.
 */
export const SUPABASE_CLIENT = new InjectionToken<SupabaseClient>(
    'SupabaseClient',
    {
        factory: () =>
            createClient(
                environment.supabaseUrl,
                environment.supabaseKey,
                { auth: { persistSession: true } }
            ),
    }
);
