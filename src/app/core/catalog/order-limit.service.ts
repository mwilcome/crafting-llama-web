import { inject, Injectable, computed, effect, signal } from '@angular/core';
import { SUPABASE_CLIENT } from '@core/supabase/supabase.client';

@Injectable({ providedIn: 'root' })
export class OrderLimitService {
    private readonly supabase = inject(SUPABASE_CLIENT);

    private readonly _activeCount = signal<number | null>(null);
    private readonly _limit = signal<number | null>(null);

    readonly activeCount = computed(() => this._activeCount());
    readonly limit = computed(() => this._limit());

    readonly isAtLimit = computed(() => {
        const count = this._activeCount();
        const limit = this._limit();
        return count !== null && limit !== null && count >= limit;
    });

    async refresh(): Promise<void> {
        const [countRes, limitRes] = await Promise.all([
            this.supabase.rpc('count_active_orders'),
            this.supabase.from('site_config').select('value').eq('key', 'max_active_orders').single(),
        ]);

        if (countRes.data !== null) this._activeCount.set(countRes.data);
        if (limitRes.data?.value !== undefined) this._limit.set(Number(limitRes.data.value));
    }

    constructor() {
        // auto-fetch on init
        void this.refresh();
    }
}
