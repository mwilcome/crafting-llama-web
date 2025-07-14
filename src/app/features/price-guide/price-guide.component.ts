import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { DesignService } from '@core/catalog/design.service';
import { SUPABASE_CLIENT } from '@core/supabase/supabase.client';
import { Design } from '@core/catalog/design.types';

interface PricingExampleRaw {
    id: string;
    design_id: string;
    variant_id?: string;
    base_item: string;
    design_fee: number;
    base_cost: number;
    total_estimate: number;
    notes?: string;
}

interface PricingExample {
    id: string;
    designName: string;
    variantName?: string;
    baseItem: string;
    designFee: number;
    baseCost: number;
    totalEstimate: number;
    notes?: string;
}

@Component({
    selector: 'app-price-guide',
    standalone: true,
    imports: [CommonModule, RouterModule],
    templateUrl: './price-guide.component.html',
    styleUrls: ['./price-guide.component.scss'],
})
export class PriceGuideComponent implements OnInit {
    private sb = inject(SUPABASE_CLIENT);
    private designService = inject(DesignService);

    pricingExamples = signal<PricingExample[]>([]);

    ngOnInit(): void {
        const designs = this.designService.designs();
        this.fetchExamples().then(raw => {
            const hydrated = raw.map(ex => this.hydrateExample(ex, designs));
            this.pricingExamples.set(hydrated);
        }).catch(err => {
            console.error('Error fetching pricing examples:', err);
            this.pricingExamples.set([]);
        });
    }

    private async fetchExamples(): Promise<PricingExampleRaw[]> {
        const { data, error } = await this.sb
            .from('pricing_examples')
            .select('*')
            .eq('active', true)
            .order('updated_at', { ascending: false });

        if (error) {
            throw error;
        }
        return data ?? [];
    }

    private hydrateExample(raw: PricingExampleRaw, designs: Design[]): PricingExample {
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