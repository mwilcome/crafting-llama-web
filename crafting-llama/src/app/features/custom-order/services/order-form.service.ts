import { Injectable } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Design, FieldDef, OrderDraftEntry } from '@core/catalog/design.types';

@Injectable({ providedIn: 'root' })
export class OrderFormService {
    constructor(private fb: FormBuilder) {}

    getFields(entry: OrderDraftEntry, designs: Design[]): FieldDef[] {
        const design = designs.find(d => d.id === entry.designId);
        const variant = design?.variants?.find(v => v.id === entry.variantId);
        const baseFields = variant?.fields?.length ? variant.fields : design?.fields ?? [];

        const existingKeys = new Set(baseFields.map(f => f.key));
        const hiddenKeys = ['designId', 'variantId'];

        const hiddenExtras = hiddenKeys
            .filter(k => !existingKeys.has(k))
            .map(key => ({
                key,
                label: '',
                type: 'hidden',
                required: false
            } satisfies FieldDef));

        return [...baseFields, ...hiddenExtras];
    }

    getFieldLabel(entry: OrderDraftEntry, key: string, designs: Design[]): string {
        return this.getFields(entry, designs).find(f => f.key === key)?.label ?? key;
    }

    buildForm(fields: FieldDef[], entry: OrderDraftEntry): FormGroup {
        const group: { [key: string]: FormControl } = {};

        for (const field of fields) {
            const validators = field.required ? [Validators.required] : [];
            const isFile = field.type === 'file';
            const defaultValue = entry.values?.[field.key] ?? field.defaultValue ?? (isFile ? null : '');
            group[field.key] = new FormControl(defaultValue, validators);
        }

        if (!group['quantity']) {
            group['quantity'] = new FormControl(entry.quantity ?? 1, [Validators.required]);
        }

        return this.fb.group(group);
    }
}
