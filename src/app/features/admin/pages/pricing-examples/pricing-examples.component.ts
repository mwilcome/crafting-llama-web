import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { DesignService } from '@core/catalog/design.service';
import { Design, Variant } from '@core/catalog/design.types';
import { SUPABASE_CLIENT } from '@core/supabase/supabase.client';

interface PricingExample {
    id: string;
    designId: string;
    variantId?: string;
    baseItem: string;
    designFee: number;
    baseCost: number;
    totalEstimate: number;
    notes?: string;
    designName?: string;
    variantName?: string;
}

@Component({
    selector: 'app-pricing-examples-admin',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, FormsModule, RouterModule],
    templateUrl: './pricing-examples.component.html',
    styleUrls: ['./pricing-examples.component.scss'],
})
export class PricingExamplesAdminComponent {
    private sb = inject(SUPABASE_CLIENT);
    private designService = inject(DesignService);
    private fb = inject(FormBuilder);

    designs = this.designService.designs;
    examples = signal<PricingExample[]>([]);
    searchTerm = signal('');
    editingId: string | null = null;

    exampleForm = this.fb.group({
        designId: ['', Validators.required],
        variantId: [''],
        baseItem: ['', Validators.required],
        designFee: [0, [Validators.required, Validators.min(0)]],
        baseCost: [0, [Validators.required, Validators.min(0)]],
        notes: [''],
    });

    selectedVariants = computed(() => {
        const designId = this.exampleForm.get('designId')?.value;
        const design = this.designs().find(d => d.id === designId);
        return design?.variants ?? [];
    });

    filteredExamples = computed(() => {
        const term = this.searchTerm().toLowerCase();
        return this.examples().filter(ex =>
            ex.designName?.toLowerCase().includes(term) ||
            ex.variantName?.toLowerCase().includes(term) ||
            ex.baseItem.toLowerCase().includes(term) ||
            ex.notes?.toLowerCase().includes(term)
        );
    });

    constructor() {
        this.loadExamples();
    }

    async loadExamples(): Promise<void> {
        const { data, error } = await this.sb
            .from('pricing_examples')
            .select('*')
            .eq('active', true)
            .order('updated_at', { ascending: false });

        if (error) {
            console.error('Error loading examples:', error);
            return;
        }

        const designs = this.designs();
        const hydrated = (data ?? []).map(raw => this.hydrateExample(raw, designs));
        this.examples.set(hydrated);
    }

    onDesignChange(event: Event): void {
        this.exampleForm.patchValue({ variantId: '' });
    }

    async saveExample(): Promise<void> {
        if (this.exampleForm.invalid) return;

        const formValue = this.exampleForm.value;
        const payload = {
            design_id: formValue.designId,
            variant_id: formValue.variantId || null,
            base_item: formValue.baseItem,
            design_fee: formValue.designFee,
            base_cost: formValue.baseCost,
            total_estimate: (formValue.designFee || 0) + (formValue.baseCost || 0),
            notes: formValue.notes || null,
            active: true,
        };

        if (this.editingId) {
            await this.sb.from('pricing_examples').update(payload).eq('id', this.editingId);
        } else {
            await this.sb.from('pricing_examples').insert(payload);
        }

        this.resetForm();
        await this.loadExamples();
    }

    editExample(example: PricingExample): void {
        this.editingId = example.id;
        this.exampleForm.patchValue({
            designId: example.designId,
            variantId: example.variantId || '',
            baseItem: example.baseItem,
            designFee: example.designFee,
            baseCost: example.baseCost,
            notes: example.notes || '',
        });
    }

    async deleteExample(id: string): Promise<void> {
        if (confirm('Are you sure you want to delete this example?')) {
            await this.sb.from('pricing_examples').update({ active: false }).eq('id', id);
            await this.loadExamples();
        }
    }

    resetForm(): void {
        this.editingId = null;
        this.exampleForm.reset({
            designId: '',
            variantId: '',
            baseItem: '',
            designFee: 0,
            baseCost: 0,
            notes: '',
        });
    }

    private hydrateExample(raw: any, designs: Design[]): PricingExample {
        const design = designs.find(d => d.id === raw.design_id);
        const variant = design?.variants?.find(v => v.id === raw.variant_id);

        return {
            id: raw.id,
            designId: raw.design_id,
            variantId: raw.variant_id,
            baseItem: raw.base_item,
            designFee: raw.design_fee,
            baseCost: raw.base_cost,
            totalEstimate: raw.total_estimate,
            notes: raw.notes,
            designName: design?.name ?? 'Unknown',
            variantName: variant?.name,
        };
    }
}