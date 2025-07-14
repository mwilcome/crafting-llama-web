/****************************************************************
 * AuthService – Supabase JS v2 + magic-link
 * Exposes:
 *   session()          -> current Session | null  (signal)
 *   waitUntilReady()   -> Promise<void> resolves when session loaded
 *   signIn(email)      -> sends magic link
 ****************************************************************/
import { inject, Injectable, signal } from '@angular/core';
import { Session } from '@supabase/supabase-js';
import { SUPABASE_CLIENT } from '@core/supabase/supabase.client';

@Injectable({ providedIn: 'root' })
export class AuthService {
    private sb = inject(SUPABASE_CLIENT);

    private readonly _session = signal<Session | null>(null);
    readonly  session         = this._session.asReadonly();

    private readonly ready: Promise<void>;

    constructor() {
        this.ready = this.init();
    }

    signIn(email: string) {
        return this.sb.auth.signInWithOtp({
            email,
            options: { emailRedirectTo: `${location.origin}/admin/dashboard` }
        });
    }

    signOut() {
        return this.sb.auth.signOut();
    }

    waitUntilReady(): Promise<void> { return this.ready; }

    private async init(): Promise<void> {
        const { data } = await this.sb.auth.getSession();
        this._session.set(data.session);

        this.sb.auth.onAuthStateChange((_event, session) => {
            this._session.set(session);
            if (location.search.includes('access_token')) {
                history.replaceState({}, '', location.pathname);
            }
        });
    }
}
