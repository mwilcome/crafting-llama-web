import { Injectable, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { OrderDraftEntry, OrderEntry } from './order-entry.model';
import { Design, Variant, FieldDefinition } from '@core/catalog/design.types';

@Injectable({ providedIn: 'root' })
export class OrderContextService {
    private readonly fb = inject(FormBuilder);

    private readonly draft = signal<OrderDraftEntry>({
        id: crypto.randomUUID(),
        design: undefined,
        variant: null,
        form: this.fb.group({}),
        imagePreviews: {},
    });

    private readonly drafts = signal<OrderEntry[]>([]);

    draft$ = this.draft.asReadonly();
    drafts$ = this.drafts.asReadonly();

    setDesign(design: Design) {
        this.draft.set({
            id: crypto.randomUUID(),
            design,
            variant: null,
            form: this.fb.group({}),
            imagePreviews: {},
        });
    }

    setVariant(variant: Variant | null) {
        const fields = variant?.fields ?? this.draft()?.design?.fields ?? [];
        const form = this.buildForm(fields);
        this.draft.update(d => ({
            ...d,
            variant,
            form,
            imagePreviews: {},
        }));
    }

    setForm(form: FormGroup) {
        this.draft.update(d => ({ ...d, form }));
    }

    setImagePreviews(previews: Record<string, string>) {
        this.draft.update(d => ({ ...d, imagePreviews: previews }));
    }

    finalizeDraft() {
        const current = this.draft();
        if (!current.design || !current.form?.value) return;

        const entry: OrderEntry = {
            id: crypto.randomUUID(),
            design: current.design,
            variant: current.variant ?? undefined,
            form: current.form.getRawValue(),
        };

        this.drafts.update(arr => [...arr, entry]);
        this.resetDraft();
    }

    resetDraft() {
        this.draft.set({
            id: crypto.randomUUID(),
            design: undefined,
            variant: null,
            form: this.fb.group({}),
            imagePreviews: {},
        });
    }

    loadDraft(entry: OrderEntry) {
        const fields = entry.variant?.fields ?? entry.design.fields ?? [];
        const form = this.fb.group(
            Object.fromEntries(fields.map(field => [field.name, [entry.form[field.name] ?? '']]))
        );

        this.draft.set({
            id: crypto.randomUUID(),
            design: entry.design,
            variant: entry.variant ?? null,
            form,
            imagePreviews: {},
        });
    }

    removeDraft(id: string) {
        this.drafts.update(arr => arr.filter(entry => entry.id !== id));
    }

    clearAll() {
        this.drafts.set([]);
        this.resetDraft();
    }

    private buildForm(fields: FieldDefinition[]): FormGroup {
        const group: Record<string, any> = {};
        for (const field of fields) {
            if (field.type === 'multiselect') {
                group[field.name] = [[]];
            } else if (field.type === 'file') {
                group[field.name] = [null];
            } else {
                group[field.name] = [''];
            }
        }
        return this.fb.group(group);
    }
}
