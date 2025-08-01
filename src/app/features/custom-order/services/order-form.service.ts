import { Injectable } from '@angular/core';
import {
    AbstractControl,
    FormBuilder,
    FormControl,
    FormGroup,
    ValidationErrors,
    Validators,
} from '@angular/forms';

import { Design, FieldDef, OrderDraftEntry } from '@core/catalog/design.types';
import { OrderDraftService } from '@services/order-draft.service';

@Injectable({ providedIn: 'root' })
export class OrderFormService {
    constructor(private fb: FormBuilder, private draft: OrderDraftService) {}

    getFields(entry: OrderDraftEntry, designs: Design[], isNewEntry: boolean = false): FieldDef[] {
        const designId = isNewEntry && this.draft.pendingDesign()?.id
            ? this.draft.pendingDesign()!.id
            : entry.designId;
        console.log('Generating fields for designId:', designId, 'isNewEntry:', isNewEntry, 'entryId:', entry.id);
        const design = designs.find(d => d.id === designId);
        const variant = design?.variants?.find(v => v.id === entry.variantId);
        const base = variant?.fields?.length ? variant.fields : design?.fields ?? [];

        const hiddenKeys = ['designId', 'variantId'];
        const extras = hiddenKeys
            .filter(k => !base.some(f => f.key === k))
            .map(
                key =>
                    ({
                        key,
                        label: '',
                        type: 'hidden',
                        required: false,
                    }) as FieldDef
            );

        return [...base, ...extras];
    }

    getFieldLabel(entry: OrderDraftEntry, key: string, designs: Design[]): string {
        return this.getFields(entry, designs).find(f => f.key === key)?.label ?? key;
    }

    private requiredArrayValidator(control: AbstractControl): ValidationErrors | null {
        const v = control.value;
        return Array.isArray(v) && v.length > 0 ? null : { required: true };
    }

    buildForm(fields: FieldDef[], entry: OrderDraftEntry): FormGroup {
        const group: Record<string, FormControl> = {};

        for (const field of fields) {
            const isFile = field.type === 'file';
            const isCheckbox = field.type === 'checkbox';

            const validators = field.required ? [Validators.required] : [];

            if (isCheckbox && field.required) {
                validators.length = 0;
                validators.push(this.requiredArrayValidator);
            }

            const defaultValue =
                entry.values?.[field.key] ??
                field.defaultValue ??
                (isFile ? null : isCheckbox ? [] : '');

            group[field.key] = new FormControl(defaultValue, validators);
        }

        if (!group['quantity']) {
            group['quantity'] = new FormControl(entry.quantity ?? 1, [Validators.required]);
        }

        return this.fb.group(group);
    }
}