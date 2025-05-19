import {inject, Injectable} from '@angular/core';
import { signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { Design, Variant, FieldDef } from '@core/catalog/design.types';
import { InProgressEntry } from '@models/order-entry.model';
import { coerceFields } from '@core/utils/field-coercion';

type Step = 'select' | 'variant' | 'form' | 'review' | 'summary';

@Injectable({ providedIn: 'root' })
export class OrderFlowService {
    private readonly router = inject(Router);

    private readonly inProgress = signal<InProgressEntry | null>(null);
    private readonly selectedDesign = signal<Design | null>(null);
    private readonly selectedVariant = signal<Variant | null>(null);

    readonly design = computed(() => this.selectedDesign());
    readonly variant = computed(() => this.selectedVariant());
    readonly inProgressEntry = computed(() => this.inProgress());

    goTo(step: Step) {
        this.router.navigate(['/custom', step]);
    }

    setDesign(design: Design) {
        this.selectedDesign.set(design);
    }

    setVariant(variant: Variant) {
        this.selectedVariant.set(variant);
    }

    startNewEntry(design: Design, variant: Variant) {
        const fields: FieldDef[] = coerceFields(variant.fields);
        this.inProgress.set({
            design,
            variant,
            fields,
            values: {},
            quantity: 1
        });
        this.goTo('form');
    }

    updateInProgressField(key: string, value: string) {
        this.inProgress.update(prev => {
            if (!prev) return null;
            return {
                ...prev,
                values: { ...prev.values, [key]: value }
            };
        });
    }

    updateQuantity(quantity: number) {
        this.inProgress.update(prev => {
            if (!prev) return null;
            return { ...prev, quantity };
        });
    }

    clearInProgress() {
        this.inProgress.set(null);
        this.selectedDesign.set(null);
        this.selectedVariant.set(null);
    }
}
