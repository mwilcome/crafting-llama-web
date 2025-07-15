import {inject, Injectable} from '@angular/core';
import {SupabaseClient} from "@supabase/supabase-js";
import {SUPABASE_CLIENT} from "@core/supabase/supabase.client";
import {Design} from "@core/catalog/design.types";
import {PricingExampleRaw, PricingExample} from "./pricing.types";

@Injectable({ providedIn: 'root' })
export class PricingExampleService {
    private readonly supabase = inject<SupabaseClient>(SUPABASE_CLIENT);

    async fetchExamples(): Promise<PricingExampleRaw[]> {
        const { data, error } = await this.supabase
            .from('pricing_examples')
            .select('*')
            .eq('active', true)
            .order('updated_at', { ascending: false });

        if (error) {
            throw error;
        }
        return data ?? [];
    }

    hydrateExample(raw: PricingExampleRaw, designs: Design[]): PricingExample {
        const design = designs.find(d => d.id === raw.design_id);
        const variant = design?.variants?.find(v => v.id === raw.variant_id);

        return {
            id: raw.id,
            designName: design?.name ?? 'Unknown Design',
            variantName: variant?.name,
            baseItem: raw.base_item,
            designFee: raw.design_fee,
            baseCost: raw.base_cost,
            totalEstimate: raw.total_estimate,
            notes: raw.notes,
        };
    }
}