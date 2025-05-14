import { Injectable, computed, signal } from '@angular/core';
import { DesignMeta, VariantMeta } from '@core/catalog/design.types';
import { FormGroup } from '@angular/forms';
import { OrderDraftEntry, StepName } from './order-entry.model';
import { v4 as uuidv4 } from 'uuid';

@Injectable({ providedIn: 'root' })
export class OrderContextService {
    private readonly drafts = signal<OrderDraftEntry[]>([]);
    private readonly currentDraftId = signal<string | null>(null);
    private readonly step = signal<StepName>('select');

    readonly stepSignal = computed(() => this.step());
    readonly draftSignal = computed(() => {
        const id = this.currentDraftId();
        return this.drafts().find(d => d.id === id) ?? null;
    });

    constructor() {
        if (this.drafts().length === 0) {
            this.addNewDraft();
        }
    }

    getAllDrafts(): OrderDraftEntry[] {
        return this.drafts();
    }

    setStep(step: StepName): void {
        this.step.set(step);
    }

    addNewDraft(): void {
        const newId = uuidv4();
        const entry: OrderDraftEntry = {
            id: newId,
            design: undefined!,
            form: undefined!,
            imagePreviews: {},
        };
        this.drafts.set([...this.drafts(), entry]);
        this.currentDraftId.set(newId);
        this.setStep('select');
    }

    editDraft(id: string): void {
        if (this.drafts().some(d => d.id === id)) {
            this.currentDraftId.set(id);
        }
    }

    removeDraft(id: string): void {
        const remaining = this.drafts().filter(d => d.id !== id);
        this.drafts.set(remaining);

        if (this.currentDraftId() === id) {
            const fallback = remaining[0]?.id ?? null;
            this.currentDraftId.set(fallback);
            this.setStep('select');
        }
    }

    selectDesign(design: DesignMeta): void {
        const id = this.currentDraftId();
        const updated = this.drafts().map(d =>
            d.id === id ? { ...d, design } : d
        );
        this.drafts.set(updated);
    }

    selectVariant(variantId: string): void {
        const draft = this.draftSignal();
        if (!draft?.design?.variants) return;

        const selected = draft.design.variants.find(v => v.id === variantId);
        if (!selected) return;

        const updated = this.drafts().map(d =>
            d.id === this.currentDraftId() ? { ...d, variant: selected } : d
        );
        this.drafts.set(updated);
    }

    saveForm(form: FormGroup): void {
        const id = this.currentDraftId();
        const updated = this.drafts().map(d =>
            d.id === id ? { ...d, form } : d
        );
        this.drafts.set(updated);
    }
}
