import { Injectable } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { FieldDef } from '@core/catalog/design.types';

@Injectable({ providedIn: 'root' })
export class OrderFormService {
    build(fields: FieldDef[]): FormGroup {
        const group: Record<string, FormControl> = {};
        for (const field of fields) {
            const validators = field.required ? [Validators.required] : [];
            group[field.key] = new FormControl(field.defaultValue ?? '', validators);
        }
        return new FormGroup(group);
    }
}
