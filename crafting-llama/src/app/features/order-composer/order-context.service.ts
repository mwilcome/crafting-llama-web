import { Injectable, signal } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Design } from '@core/catalog/design.types';
import { OrderDraftEntry, OrderEntry } from './order-entry.model';
import { DESIGNS } from '@core/catalog/designs';

@Injectable({ providedIn: 'root' })
export class OrderContextService {
    readonly draft = signal<OrderDraftEntry>({
        id: crypto.randomUUID(),
        design: undefined,
        variant: undefined,
        form: null,
        imagePreviews: {}
    });

    readonly drafts = signal<OrderEntry[]>([]);
    readonly designs = signal<Design[]>(DESIGNS);

    setDesign(design: Design): void {
        this.draft.set({
            id: crypto.randomUUID(),
            design,
            variant: undefined,
            form: null,
            imagePreviews: {}
        });
    }

    setVariant(variant: OrderDraftEntry['variant']): void {
        this.draft.update(d => ({
            ...d,
            variant,
            form: null
        }));
    }

    setForm(form: FormGroup): void {
        this.draft.update(d => ({
            ...d,
            form
        }));
    }

    finalizeDraft(): void {
        const d = this.draft();
        if (!d.design || !d.form) return;

        const entry: OrderEntry = {
            id: d.id,
            design: d.design,
            variant: d.variant ?? undefined,
            form: d.form
        };

        this.drafts.update(existing => [...existing, entry]);
        this.resetDraft();
    }

    loadDraft(entry: OrderEntry): void {
        this.draft.set({
            id: entry.id,
            design: entry.design,
            variant: entry.variant ?? undefined,
            form: entry.form as FormGroup,
            imagePreviews: {}
        });
    }

    removeDraft(id: string): void {
        this.drafts.update(all => all.filter(entry => entry.id !== id));
    }

    resetDraft(): void {
        this.draft.set({
            id: crypto.randomUUID(),
            design: undefined,
            variant: undefined,
            form: null,
            imagePreviews: {}
        });
    }
}
