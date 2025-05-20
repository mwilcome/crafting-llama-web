import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, FormControl, ReactiveFormsModule } from '@angular/forms';
import { FieldDef } from '@core/catalog/design.types';

@Component({
    selector: 'app-field-renderer',
    standalone: true,
    templateUrl: './field-renderer.component.html',
    styleUrls: ['./field-renderer.component.scss'],
    imports: [CommonModule, ReactiveFormsModule],
})
export class FieldRendererComponent {
    @Input({ required: true }) field!: FieldDef;
    @Input({ required: true }) form!: FormGroup;

    get control(): FormControl {
        return this.form.get(this.field.key) as FormControl;
    }

    handleFile(event: Event): void {
        const input = event.target as HTMLInputElement;
        const file = input.files?.[0] || null;
        if (file && this.control) {
            this.control.setValue(file);
        }
    }
}
