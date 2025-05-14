import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
    ReactiveFormsModule,
    FormBuilder,
    FormControl,
    FormGroup,
    Validators
} from '@angular/forms';
import { FieldDefinition, DesignMeta, VariantMeta } from '@core/catalog/design.types';

@Component({
    selector: 'app-entry-form',
    standalone: true,
    templateUrl: './entry-form.component.html',
    styleUrls: ['./entry-form.component.scss'],
    imports: [CommonModule, ReactiveFormsModule]
})
export class EntryFormComponent {
    private readonly fb = inject(FormBuilder);

    @Input() design?: DesignMeta;
    @Input() variant?: VariantMeta;
    @Input() initialForm?: FormGroup;

    @Output() formChange = new EventEmitter<FormGroup>();

    form: FormGroup = this.fb.group({});
    imagePreviews: Record<string, string> = {};

    ngOnInit(): void {
        const fields = this.variant?.fields ?? this.design?.fields ?? [];
        this.form = this.initialForm ?? this.buildForm(fields);
        this.formChange.emit(this.form);
    }

    buildForm(fields: FieldDefinition[]): FormGroup {
        const group: Record<string, FormControl> = {};
        for (const field of fields) {
            let defaultValue: any = '';

            switch (field.type) {
                case 'multiselect':
                    defaultValue = [];
                    break;
                case 'dropdown':
                case 'radio':
                case 'color':
                    defaultValue = field.options?.[0] ?? '';
                    break;
                case 'file':
                    defaultValue = null;
                    break;
            }

            group[field.name] = field.required
                ? this.fb.control(defaultValue, Validators.required)
                : this.fb.control(defaultValue);
        }
        return this.fb.group(group);
    }

    onMultiSelectChange(e: Event, name: string): void {
        const input = e.target as HTMLInputElement;
        const current = this.form.get(name)?.value ?? [];
        const updated = input.checked
            ? [...current, input.value]
            : current.filter((v: string) => v !== input.value);
        this.form.get(name)?.setValue(updated);
    }

    onFileChange(e: Event, name: string): void {
        const input = e.target as HTMLInputElement;
        if (input.files?.length) {
            const file = input.files[0];
            this.form.get(name)?.setValue(file);
            this.imagePreviews[name] = URL.createObjectURL(file);
        }
    }
}
