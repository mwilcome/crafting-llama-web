import { Injectable } from '@angular/core';
import { FormControl, FormGroup, Validators, ValidatorFn } from '@angular/forms';
import { FieldDef } from '@models/order-entry.model';

@Injectable({ providedIn: 'root' })
export class OrderFormService {
    build(fields: FieldDef[]): FormGroup {
        const group: Record<string, FormControl | FormGroup> = {};

        for (const field of fields) {
            const validators: ValidatorFn[] = [
                ...(field.required ? [Validators.required] : []),
                ...(field.validators ?? []),
            ];

            group[field.key] =
                field.type === 'group' && field.children
                    ? this.build(field.children)
                    : new FormControl(field.default ?? '', validators);
        }

        return new FormGroup(group);
    }

    getError(form: FormGroup, key: string): string | null {
        const ctrl = form.get(key);
        if (ctrl?.hasError('required')) return 'This field is required';
        return null;
    }
}
