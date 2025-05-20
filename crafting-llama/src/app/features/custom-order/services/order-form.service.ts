import { Injectable } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Design, FieldDef, Variant } from '@core/catalog/design.types';

@Injectable({ providedIn: 'root' })
export class OrderFormService {
    constructor(private fb: FormBuilder) {}

    /**
     * Returns the appropriate fields for the given design/variant.
     * Variant fields override design fields if present.
     */
    getFields(design: Design, variant?: Variant): FieldDef[] {
        return variant?.fields?.length ? variant.fields : design.fields;
    }

    /**
     * Builds a FormGroup based on a list of FieldDefs,
     * respecting default values and required validation.
     */
    buildForm(fields: FieldDef[]): FormGroup {
        const group: Record<string, FormControl> = {};

        fields.forEach(field => {
            const defaultVal = field.defaultValue ?? '';
            const validators = field.required ? [Validators.required] : [];

            group[field.key] = this.fb.control(defaultVal, validators);
        });

        // Quantity is always required and must be at least 1
        group['quantity'] = this.fb.control(1, [Validators.required, Validators.min(1)]);

        return this.fb.group(group);
    }
}
