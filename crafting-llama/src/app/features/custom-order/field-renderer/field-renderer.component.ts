import { Component, Input } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { FieldDef } from '@core/catalog/design.types';

@Component({
    selector: 'app-field-renderer',
    standalone: true,
    templateUrl: './field-renderer.component.html',
    styleUrls: ['./field-renderer.component.scss'],
    imports: [ReactiveFormsModule],
})
export class FieldRendererComponent {
    @Input({ required: true }) field!: FieldDef;
    @Input({ required: true }) form!: FormGroup;
    @Input({ required: true }) showErrors!: (fieldKey: string) => boolean;

    previewUrl: string | null = null;

    get control(): FormControl | null {
        return this.form.get(this.field.key) as FormControl;
    }

    get ready(): boolean {
        return !!this.form && this.form.contains(this.field.key);
    }

    handleFile(event: Event): void {
        const input = event.target as HTMLInputElement;
        const file = input.files?.[0];
        if (file) {
            this.control?.setValue(file);
            this.previewUrl = URL.createObjectURL(file);
        }
    }

    getCheckboxValue(value: string): boolean {
        const current = this.control?.value as string[] || [];
        return current.includes(value);
    }

    toggleCheckbox(value: string): void {
        const current = new Set(this.control?.value || []);
        current.has(value) ? current.delete(value) : current.add(value);
        this.control?.setValue(Array.from(current));
    }
}
