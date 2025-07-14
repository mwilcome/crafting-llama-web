import {inject, Injectable} from '@angular/core';
import {SupabaseClient} from "@supabase/supabase-js";
import {SUPABASE_CLIENT} from "@core/supabase/supabase.client";

export interface PricingExample {
    id: string;
    design_id: string;
    variant_id?: string;
    base_item: string;
    design_fee: number;
    base_cost: number;
    total_estimate: number;
    notes?: string;
    design_name?: string;
    variant_name?: string;
}

@Injectable({ providedIn: 'root' })
export class PricingExampleService {
    private readonly supabase = inject<SupabaseClient>(SUPABASE_CLIENT);

    async getPricingExamples(): Promise<PricingExample[]> {
        const { data, error } = await this.supabase
            .from('pricing_examples')
            .select(`
        id,
        base_item,
        design_fee,
        base_cost,
        total_estimate,
        notes,
        designs (name as design_name),
        variants (name as variant_name)
      `)
            .eq('active', true)
            .order('updated_at', { ascending: false });

        if (error) throw error;
        return data.map((item: any) => ({
            ...item,
            design_name: item.designs?.design_name,
            variant_name: item.variants?.variant_name,
        }));
    }

    // Add methods for admin CRUD, e.g., addExample, updateExample
}