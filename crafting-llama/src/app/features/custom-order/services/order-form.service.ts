import { Injectable } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Design, FieldDef, Variant } from '@core/catalog/design.types';

@Injectable({ providedIn: 'root' })
export class OrderFormService {
    constructor(private fb: FormBuilder) {}

    getFields(design: Design, variant?: Variant): FieldDef[] {
        return variant?.fields?.length ? variant.fields : design.fields;
    }

    buildForm(fields: FieldDef[]): FormGroup {
        const group: Record<string, FormControl> = {};

        fields.forEach(field => {
            const isMulti = field.multiselect === true;
            const defaultValue = field.defaultValue ?? (isMulti ? [] : '');
            const validators = field.required ? [Validators.required] : [];

            group[field.key] = this.fb.control(
                { value: defaultValue, disabled: !!field.disabled },
                validators
            );
        });

        group['quantity'] = this.fb.control(1, [Validators.required, Validators.min(1)]);

        return this.fb.group(group);
    }
}
