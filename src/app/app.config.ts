import { ApplicationConfig } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter, withInMemoryScrolling } from '@angular/router';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

import { routes } from './app.routes';
import { environment } from '@env/environment';
import { SUPABASE_CLIENT } from '@core/supabase/supabase.client';

const supabaseFactory = () =>
    createClient(environment.supabaseUrl, environment.supabaseKey, {
        auth: { persistSession: true }
    });

export const appConfig: ApplicationConfig = {
    providers: [
        provideHttpClient(),
        provideRouter(routes, withInMemoryScrolling({ scrollPositionRestoration: 'top' })),
        { provide: SupabaseClient, useFactory: supabaseFactory },
        { provide: SUPABASE_CLIENT, useExisting: SupabaseClient }
    ]
};
