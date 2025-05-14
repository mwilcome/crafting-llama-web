import { Injectable, computed, signal } from '@angular/core';
import { DesignMeta } from '@core/catalog/design.types';
import { FormGroup } from '@angular/forms';
import { OrderDraftEntry, StepName } from './order-entry.model';
import { v4 as uuidv4 } from 'uuid';

@Injectable({ providedIn: 'root' })
export class OrderContextService {
    /* ───────── internal state ───────── */
    private readonly drafts        = signal<OrderDraftEntry[]>([]);
    private readonly currentDraftId = signal<string | null>(null);
    private readonly step           = signal<StepName>('select');

    /* ───────── public signals ───────── */
    readonly stepSignal  = computed(() => this.step());
    readonly draftSignal = computed(() => {
        const id = this.currentDraftId();
        return this.drafts().find(d => d.id === id) ?? null;
    });

    /* ───────── ctor ───────── */
    constructor() {
        if (this.drafts().length === 0) this.addNewDraft();
    }

    /* ───────── getters ───────── */
    getAllDrafts(): OrderDraftEntry[] { return this.drafts(); }

    /* ───────── navigation ───────── */
    setStep(step: StepName): void {
        console.log('OrderContextService.setStep →', step);
        this.step.set(step);
    }

    /* ───────── draft CRUD ───────── */
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
        if (this.drafts().some(d => d.id === id)) this.currentDraftId.set(id);
    }

    removeDraft(id: string): void {
        const remaining = this.drafts().filter(d => d.id !== id);
        this.drafts.set(remaining);

        /* if the active draft was removed, recover gracefully */
        if (this.currentDraftId() === id) {
            if (remaining.length) {
                this.currentDraftId.set(remaining[0].id);
                this.setStep('select');
            } else {
                this.currentDraftId.set(null);
                this.addNewDraft();          // ← ensures UI never ends up with zero drafts
            }
        }
    }

    /* ───────── data setters ───────── */
    selectDesign(design: DesignMeta): void {
        this.drafts.set(
            this.drafts().map(d =>
                d.id === this.currentDraftId() ? { ...d, design } : d
            )
        );
    }

    selectVariant(variantId: string): void {
        const draft = this.draftSignal();
        if (!draft?.design?.variants) return;

        const variant = draft.design.variants.find(v => v.id === variantId);
        if (!variant) return;

        this.drafts.set(
            this.drafts().map(d =>
                d.id === this.currentDraftId() ? { ...d, variant } : d
            )
        );
    }

    saveForm(form: FormGroup): void {
        this.drafts.set(
            this.drafts().map(d =>
                d.id === this.currentDraftId() ? { ...d, form } : d
            )
        );
    }
}
