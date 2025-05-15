import {
    Component,
    Input,
    Signal,
    effect,
    inject,
    signal
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
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

    constructor() {}

    onFileChange(event: Event): void {
        const input = event.target as HTMLInputElement;
        const file = input?.files?.[0] ?? null;
        if (file && this.form && this.field?.key) {
            this.form.get(this.field.key)?.setValue(file);
        }
    }
}
