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

    /* Promise the guard can await */
    private readonly ready: Promise<void>;

    constructor() {
        this.ready = this.init();          // kick off async boot
    }

    /* ---------- public helpers ---------- */
    signIn(email: string) {
        return this.sb.auth.signInWithOtp({
            email,
            options: { emailRedirectTo: `${location.origin}/admin/dashboard` }
        });
    }

    signOut() {
        return this.sb.auth.signOut();
    }

    /** guard calls this to wait for first session check */
    waitUntilReady(): Promise<void> { return this.ready; }

    /* ---------- private ---------- */
    private async init(): Promise<void> {
        /* 1️⃣ get cached session (Supabase already detected tokens) */
        const { data } = await this.sb.auth.getSession();
        this._session.set(data.session);

        /* 2️⃣ keep signal updated on every auth change */
        this.sb.auth.onAuthStateChange((_event, session) => {
            this._session.set(session);
            /* scrub long ?access_token= query once signed-in */
            if (location.search.includes('access_token')) {
                history.replaceState({}, '', location.pathname);
            }
        });
    }
}
