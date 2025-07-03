import { inject, signal, computed, Injectable } from '@angular/core';
import { SUPABASE_CLIENT } from '@core/supabase/supabase.client';
import {
    Design,
    Variant,
    FieldDef,
} from '@core/catalog/design.types';

@Injectable({ providedIn: 'root' })
export class DesignService {
    private sb = inject(SUPABASE_CLIENT);

    /* ───────── reactive cache ───────── */
    private readonly _designs = signal<Design[]>([]);
    readonly designs = computed(() => this._designs());

    private version = -1;
    private pollHandle?: ReturnType<typeof setInterval>;

    constructor() {
        /* stale-while-revalidate from localStorage */
        const cached = localStorage.getItem('designs');
        if (cached) this._designs.set(JSON.parse(cached));

        this.refresh().finally(() =>
            localStorage.setItem('designs', JSON.stringify(this._designs())),
        );

        this.startPolling();
    }

    /* ───────── public helpers ───────── */

    async uploadHeroImage(file: File, designId: string): Promise<string> {
        const path = `designs/${designId}/${file.name}`;
        const { error } = await this.sb.storage.from('media').upload(path, file, {
            upsert: true,
        });
        if (error) throw error;
        return this.sb.storage.from('media').getPublicUrl(path).data.publicUrl;
    }

    async upsertDesign(design: Design): Promise<void> {
        const { id, variants = [], ...base } = design;

        /* 1 ── upsert into designs */
        const { error: de } = await this.sb.from('designs').upsert({
            id,
            name: design.name,
            description: design.description,
            hero_image: design.heroImage,
            price_from: design.priceFrom,
            tags: design.tags,
        });
        if (de) throw de;

        /* 2 ── replace variants atomically */
        const { error: delErr } = await this.sb
            .from('variants')
            .delete()
            .eq('design_id', id);
        if (delErr) throw delErr;

        if (variants.length) {
            const rows = variants.map(v => ({
                id: v.id,
                design_id: id,
                name: v.name,
                description: v.description,
                price: v.price,
                hero_image: v.heroImage,
            }));
            const { error: insErr } = await this.sb.from('variants').insert(rows);
            if (insErr) throw insErr;
        }

        await this.refresh();          // update local cache / UI
    }

    /* ───────── catalogue refresh ───────── */

    async refresh(): Promise<void> {
        const { data, error } = await this.sb
            .from('designs')
            .select(
                `id,name,description,hero_image,price_from,tags,
         variants ( id,name,description,price,hero_image )`,
            )
            .order('name');

        if (error) throw error;

        this._designs.set(
            (data ?? [])
                .map(this.rowToDesign)
                .sort((a, b) => a.name.localeCompare(b.name)),
        );
    }

    /* ───────── cheap polling via entity_version ───────── */

    private startPolling(everySeconds = 30): void {
        if (this.pollHandle) clearInterval(this.pollHandle);
        this.pollHandle = setInterval(
            () => {
                void this.checkVersion();
            },
            everySeconds * 1_000,
        );
        void this.checkVersion();
    }

    private async checkVersion(): Promise<void> {
        const { data } = await this.sb
            .from('entity_version')
            .select('version')
            .eq('entity', 'designs')
            .maybeSingle();

        if (!data || data.version === this.version) return;
        this.version = data.version;
        await this.refresh();
    }

    /* ───────── DB → model mappers ───────── */

    private rowToDesign = (row: any): Design => ({
        id: row.id,
        name: row.name,
        description: row.description ?? '',
        priceFrom: row.price_from ?? 0,
        heroImage: row.hero_image,
        fields: [] as FieldDef[],
        tags: row.tags ?? [],
        variants: (row.variants ?? []).map(this.rowToVariant),
    });

    private rowToVariant = (v: any): Variant => ({
        id: v.id,
        name: v.name,
        price: v.price,
        heroImage: v.hero_image,
        description: v.description ?? '',
        fields: [] as FieldDef[],
    });
}
