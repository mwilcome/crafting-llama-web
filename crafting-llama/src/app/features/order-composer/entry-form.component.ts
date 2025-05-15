import { Component, EventEmitter, Input, Output, effect, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Design, Variant } from './order-entry.model';

@Component({
    selector: 'app-entry-form',
    standalone: true,
    templateUrl: './entry-form.component.html',
    styleUrls: ['./entry-form.component.scss'],
    imports: [CommonModule, ReactiveFormsModule],
})
export class EntryFormComponent {
    @Input() design: Design | undefined;
    @Input() variant: Variant | null | undefined;
    @Input() initialForm: FormGroup | null | undefined;
    @Input() isEditing = false;

    @Output() complete = new EventEmitter<FormGroup>();
    @Output() back = new EventEmitter<void>();

    readonly form = signal<FormGroup | null>(null);
    readonly imagePreviews = signal<Record<string, string>>({});

    constructor(private fb: FormBuilder) {
        effect(() => {
            const v = this.variant;
            const defs = v?.fields ?? this.design?.fields;
            if (!defs) return;

            const group: Record<string, any> = {};
            for (const field of defs) {
                if (field.type === 'file') {
                    group[field.name] = [null];
                } else if (field.required) {
                    group[field.name] = ['', Validators.required];
                } else {
                    group[field.name] = [''];
                }
            }

            const built = this.fb.group(group);
            this.form.set(built);
            this.complete.emit(built);
        });
    }

    onMultiSelectChange(event: Event, fieldName: string): void {
        const input = event.target as HTMLInputElement;
        const current: string[] = this.form()?.get(fieldName)?.value || [];
        const next = input.checked
            ? [...current, input.value]
            : current.filter(v => v !== input.value);
        this.form()?.get(fieldName)?.setValue(next);
    }

    onFileInput(event: Event, fieldName: string): void {
        const input = event.target as HTMLInputElement;
        const file = input.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = () => {
            this.imagePreviews.update(prev => ({ ...prev, [fieldName]: reader.result as string }));
        };
        reader.readAsDataURL(file);
        this.form()?.get(fieldName)?.setValue(file);
    }

    onSubmit(): void {
        const f: FormGroup | null = this.form();
        if (f && f.valid) {
            this.complete.emit(f);
        }
    }

    onBackClick(): void {
        this.back.emit();
    }
}
