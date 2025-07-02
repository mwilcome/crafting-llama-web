import { bootstrapApplication } from '@angular/platform-browser';
import { provideHttpClient }    from '@angular/common/http';
import { provideRouter }        from '@angular/router';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

import { AppComponent } from './app/app.component';
import { routes }       from './app/app.routes';
import { environment }  from '@env/environment';

import { SUPABASE_CLIENT } from '@core/supabase/supabase.client';

const supabaseFactory = () =>
    createClient(
        environment.supabaseUrl,
        environment.supabaseKey,
        { auth: { persistSession: true } }
    );

bootstrapApplication(AppComponent, {
    providers: [
        provideHttpClient(),
        provideRouter(routes),

        { provide: SupabaseClient,  useFactory: supabaseFactory },
        { provide: SUPABASE_CLIENT, useExisting: SupabaseClient }
    ]
}).catch(err => console.error(err));
