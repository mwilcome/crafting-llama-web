import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Design, Variant, FieldDefinition } from '@core/catalog/design.types';

@Component({
    selector: 'app-entry-form',
    standalone: true,
    templateUrl: './entry-form.component.html',
    styleUrls: ['./entry-form.component.scss'],
    imports: [CommonModule, ReactiveFormsModule]
})
export class EntryFormComponent {
    @Input() design!: Design;
    @Input() variant?: Variant | null;
    @Input() initialForm: FormGroup | null = null;
    @Input() isEditing = false;

    @Output() formChange = new EventEmitter<FormGroup>();
    @Output() complete = new EventEmitter<FormGroup>();
    @Output() back = new EventEmitter<void>();

    form: FormGroup = inject(FormBuilder).group({});
    imagePreviews: Record<string, string> = {};

    ngOnInit(): void {
        const fields = this.variant?.fields ?? this.design.fields ?? [];
        const group: Record<string, any> = {};

        for (const field of fields) {
            group[field.name] = this.initialForm?.get(field.name)?.value ?? '';
        }

        this.form = inject(FormBuilder).group(group);
        this.form.valueChanges.subscribe(val => this.formChange.emit(this.form));
    }

    onFileChange(event: Event, name: string): void {
        const input = event.target as HTMLInputElement;
        if (!input.files?.length) return;

        const file = input.files[0];
        const reader = new FileReader();
        reader.onload = () => {
            this.imagePreviews[name] = reader.result as string;
            this.form.get(name)?.setValue(reader.result);
        };
        reader.readAsDataURL(file);
    }

    onSubmit(): void {
        if (this.form.valid) {
            this.complete.emit(this.form);
        }
    }

    onBackClick(): void {
        this.back.emit();
    }

    getDefaultValue(field: FieldDefinition): any {
        if (field.type === 'multiselect') return [];
        if (field.type === 'file') return '';
        return '';
    }

    onMultiSelectChange(event: Event, name: string): void {
        const input = event.target as HTMLInputElement;
        const option = input.value;
        const values = this.form.get(name)?.value ?? [];
        const updated = input.checked
            ? [...values, option]
            : values.filter((v: string) => v !== option);
        this.form.get(name)?.setValue(updated);
    }
}
