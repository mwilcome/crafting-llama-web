import { Injectable, signal } from '@angular/core';
import { Design, OrderDraftEntry, OrderEntry, Variant } from './order-entry.model';
import {DESIGNS} from '@core/catalog/designs';
import { FormGroup } from '@angular/forms';

@Injectable({ providedIn: 'root' })
export class OrderContextService {
    readonly draft = signal<OrderDraftEntry>({
        id: crypto.randomUUID(),
        design: undefined,
        variant: undefined,
        form: null,
        imagePreviews: {},
    });

    readonly drafts = signal<OrderEntry[]>([]);
    readonly designs = signal<Design[]>(DESIGNS);

    setDesign(design: Design): void {
        this.draft.update(d => ({
            ...d,
            design,
            variant: undefined,
            form: null,
        }));
    }

    setVariant(variant: Variant | null): void {
        this.draft.update(d => ({
            ...d,
            variant: variant ?? undefined,
            form: null,
        }));
    }

    setForm(form: FormGroup): void {
        this.draft.update(d => ({ ...d, form }));
    }

    finalizeDraft(): void {
        const d = this.draft();
        if (!d.design || !d.form) return;

        const entry: OrderEntry = {
            id: d.id,
            design: d.design!,
            variant: d.variant ?? undefined,
            form: d.form!,
        };

        this.drafts.update(all => [...all, entry]);
        this.resetDraft();
    }

    resumeDraft(entry: OrderEntry): void {
        this.draft.set({
            id: entry.id,
            design: entry.design,
            variant: entry.variant,
            form: entry.form,
            imagePreviews: {}
        });
    }

    removeDraft(id: string): void {
        this.drafts.update(all => all.filter(d => d.id !== id));
    }

    resetDraft(): void {
        this.draft.set({
            id: crypto.randomUUID(),
            design: undefined,
            variant: undefined,
            form: null,
            imagePreviews: {},
        });
    }
}
