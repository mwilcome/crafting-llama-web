import {
    Component,
    Input
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup } from '@angular/forms';
import { FieldDef } from '@core/catalog/design.types';

@Component({
    selector: 'app-field-renderer',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule],
    templateUrl: './field-renderer.component.html',
    styleUrls: ['./field-renderer.component.scss'],
})
export class FieldRendererComponent {
    @Input({ required: true }) field!: FieldDef;
    @Input({ required: true }) form!: FormGroup;

    onFileChange(event: Event): void {
        const input = event.target as HTMLInputElement;
        const file = input?.files?.[0] ?? null;
        if (file && this.form && this.field?.key) {
            this.form.get(this.field.key)?.setValue(file);
        }
    }

    onCheckboxChange(event: Event, value: string) {
        const checkbox = event.target as HTMLInputElement;
        const existing = this.form.get(this.field.key)?.value ?? [];

        const updated = checkbox.checked
            ? [...existing, value]
            : existing.filter((v: string) => v !== value);

        this.form.get(this.field.key)?.setValue(updated);
    }

    onImagePreviewChange(event: Event, key: string) {
        const input = event.target as HTMLInputElement;
        const file = input?.files?.[0];

        if (!file) return;

        const reader = new FileReader();
        reader.onload = () => {
            const result = reader.result as string;
            this.form.get(key)?.setValue(result);
        };
        reader.readAsDataURL(file);
    }
}
