import { inject, signal, computed, Injectable } from '@angular/core';
import { SUPABASE_CLIENT } from '@core/supabase/supabase.client';
import { Design, Variant, FieldDef } from '@core/catalog/design.types';

/**
 * Live-data DesignService
 * -----------------------
 * • Caches a copy in localStorage for instant first-paint
 * • Polls the lightweight entity_version table every 30 s
 *   (skip polling if you haven’t run step 6 yet).
 */
@Injectable({ providedIn: 'root' })
export class DesignService {
    private readonly supabase = inject(SUPABASE_CLIENT);

    /* reactive cache ---------------------------------------- */
    private readonly _designs = signal<Design[]>([]);
    readonly         designs  = computed(() => this._designs());

    private version   = -1;                                    // from entity_version
    private pollHandle?: ReturnType<typeof setInterval>;

    constructor() {
        /* stale-while-revalidate -------------------------------- */
        const cached = localStorage.getItem('designs');
        if (cached) this._designs.set(JSON.parse(cached));

        this.refresh().finally(() =>
            localStorage.setItem('designs', JSON.stringify(this._designs()))
        );

        this.startPolling();             // harmless if triggers not in place yet
    }

    /** Re-fetch the full catalogue */
    async refresh(): Promise<void> {
        const { data, error } = await this.supabase
            .from('designs')
            .select(`
        id, name, description, hero_image, price_from, tags,
        variants (
          id, name, price, hero_image, description,
          field_definitions (
            key, label, type, required, placeholder, options, position
          )
        )
      `)
            .order('name');

        if (error) throw error;

        this._designs.set(
            (data ?? [])
                .map(this.rowToDesign)
                .sort((a, b) => a.name.localeCompare(b.name))
        );
    }

    /* ------------- cheap polling via entity_version -------- */
    private startPolling(everySeconds = 30): void {
        if (this.pollHandle) clearInterval(this.pollHandle);
        this.pollHandle = setInterval(
            () => { void this.checkVersion(); },
            everySeconds * 1_000
        );
        void this.checkVersion();          // run once right away
    }

    private async checkVersion(): Promise<void> {
        /* If you haven’t run the SQL triggers yet this call will 404 – that’s OK. */
        const { data } = await this.supabase
            .from('entity_version')
            .select('version')
            .eq('entity', 'designs')
            .maybeSingle();                  // <= avoids throw on 404

        if (!data || data.version === this.version) return;
        this.version = data.version;
        await this.refresh();
    }

    /* ============= row mappers ============================= */
    private rowToDesign = (row: any): Design => ({
        id:          row.id,
        name:        row.name,
        description: row.description ?? '',
        priceFrom:   row.price_from ?? 0,
        heroImage:   row.hero_image,
        /** design-level fields aren’t implemented yet → keep API happy */
        fields:      [],
        tags:        row.tags ?? [],
        variants:    (row.variants ?? []).map(this.rowToVariant)
    });

    private rowToVariant = (v: any): Variant => ({
        id:          v.id,
        name:        v.name,
        price:       v.price,
        heroImage:   v.hero_image,
        description: v.description ?? '',
        fields: (v.field_definitions ?? [])
            .sort(
                (a: { position?: number }, b: { position?: number }) =>
                    (a.position ?? 0) - (b.position ?? 0)
            )
            .map(this.rowToField)
    });

    private rowToField = (f: any): FieldDef => ({
        key:         f.key,
        label:       f.label,
        type:        f.type,
        required:    f.required,
        placeholder: f.placeholder ?? '',
        options:     f.options ?? []
        /* position stays in DB only – not part of FieldDef type */
    });
}
