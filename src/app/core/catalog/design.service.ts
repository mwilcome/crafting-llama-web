import { inject, signal, computed, Injectable } from '@angular/core';
import { SUPABASE_CLIENT } from '@core/supabase/supabase.client';
import { Design, Variant, FieldDef } from '@core/catalog/design.types';

@Injectable({ providedIn: 'root' })
export class DesignService {
    private sb = inject(SUPABASE_CLIENT);

    private readonly _designs = signal<Design[]>([]);
    readonly designs = computed(() => this._designs());

    private version = -1;
    private poll?: ReturnType<typeof setInterval>;

    constructor() {
        const cached = localStorage.getItem('designs');
        if (cached) this._designs.set(JSON.parse(cached));
        this.refresh().finally(() =>
            localStorage.setItem('designs', JSON.stringify(this._designs())),
        );
        this.startPolling();
    }

    async uploadHeroImage(file: File, designId: string): Promise<string> {
        const stamp = new Date().toISOString().slice(0, 10);
        const path = `designs/${stamp}/${designId}/${file.name}`;
        await this.sb.storage.from('media').upload(path, file, { upsert: true });
        return this.sb.storage.from('media').getPublicUrl(path).data.publicUrl;
    }

    async upsertDesign(design: Design): Promise<void> {
        const { id, variants = [] } = design;

        await this.sb.from('designs').upsert({
            id,
            name: design.name,
            description: design.description,
            hero_image: design.heroImage,
            price_from: design.priceFrom,
            tags: design.tags,
            active: true,
        });

        await this.sb.from('variants').delete().eq('design_id', id);

        if (variants.length) {
            await this.sb.from('variants').insert(
                variants.map(v => ({
                    id: v.id,
                    design_id: id,
                    name: v.name,
                    description: v.description,
                    price: v.price,
                    hero_image: v.heroImage,
                    active: true,
                })),
            );
        }

        await this.upsertFields(design);
        await this.refresh();
    }

    private async upsertFields(design: Design): Promise<void> {
        const rows: any[] = [];

        const minimal = (f: FieldDef) => ({
            key: f.key,
            label: f.label,
            type: f.type,
            required: f.required ?? false,
            placeholder: f.placeholder ?? '',
            options: f.options ?? [],
        });

        design.fields.forEach(f =>
            rows.push({
                id: crypto.randomUUID(),
                design_id: design.id,
                variant_id: null,
                ...minimal(f),
            }),
        );

        design.variants?.forEach(v =>
            v.fields?.forEach(f =>
                rows.push({
                    id: crypto.randomUUID(),
                    design_id: null,
                    variant_id: v.id,
                    ...minimal(f),
                }),
            ),
        );

        const sweep = [design.id, ...(design.variants?.map(v => v.id) ?? [])];

        await this.sb
            .from('field_definitions')
            .delete()
            .or(`design_id.eq.${design.id},variant_id.in.(${sweep.slice(1).join(',')})`);

        if (rows.length) await this.sb.from('field_definitions').insert(rows);
    }

    async refresh(): Promise<void> {
        const { data } = await this.sb
            .from('designs')
            .select(`
        *,
        fields:field_definitions!left(*),
        variants:variants!left(
          *,
          fields:field_definitions!left(*)
        )
      `)
            .eq('active', true);

        this._designs.set(
            (data ?? [])
                .map(this.mapDesign)
                .sort((a, b) => a.name.localeCompare(b.name)),
        );
    }

    async listDesigns(): Promise<Design[]> {
        await this.refresh();
        return this._designs();
    }

    async getDesign(id: string): Promise<Design | null> {
        const { data } = await this.sb
            .from('designs')
            .select(`
        *,
        fields:field_definitions!left(*),
        variants:variants!left(
          *,
          fields:field_definitions!left(*)
        )
      `)
            .eq('id', id)
            .maybeSingle();
        return data ? this.mapDesign(data) : null;
    }

    async deleteDesign(id: string): Promise<void> {
        await this.sb.from('designs').update({ active: false }).eq('id', id);
        await this.refresh();
    }

    private startPolling(sec = 30): void {
        if (this.poll) clearInterval(this.poll);
        this.poll = setInterval(() => void this.checkVersion(), sec * 1_000);
        void this.checkVersion();
    }

    private async checkVersion(): Promise<void> {
        const { data } = await this.sb
            .from('entity_version')
            .select('version')
            .eq('entity', 'designs')
            .maybeSingle();

        if (data && data.version !== this.version) {
            this.version = data.version;
            await this.refresh();
        }
    }

    private mapField = (r: any): FieldDef => ({
        key: r.key,
        label: r.label,
        type: r.type,
        required: r.required ?? false,
        placeholder: r.placeholder ?? '',
        options: r.options ?? [],
    });

    private mapVariant = (v: any): Variant => ({
        id: v.id,
        name: v.name,
        price: v.price,
        heroImage: v.hero_image,
        description: v.description ?? '',
        fields: (v.fields ?? []).map(this.mapField),
    });

    private mapDesign = (d: any): Design => ({
        id: d.id,
        name: d.name,
        description: d.description ?? '',
        priceFrom: d.price_from ?? 0,
        heroImage: d.hero_image,
        tags: d.tags ?? [],
        fields: (d.fields ?? []).map(this.mapField),
        variants: (d.variants ?? []).map(this.mapVariant),
    });
}
