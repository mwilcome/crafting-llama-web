import { Component, Input } from '@angular/core';
import {FormControl, FormGroup, ReactiveFormsModule} from '@angular/forms';
import { FieldDef } from '@core/catalog/design.types';

@Component({
    selector: 'app-field-renderer',
    standalone: true,
    templateUrl: './field-renderer.component.html',
    imports: [
        ReactiveFormsModule
    ],
    styleUrls: ['./field-renderer.component.scss']
})
export class FieldRendererComponent {
    @Input({ required: true }) field!: FieldDef;
    @Input({ required: true }) form!: FormGroup;
    @Input({ required: true }) showErrors!: (fieldKey: string) => boolean;

    get control(): FormControl {
        return this.form.get(this.field.key) as FormControl;
    }

    handleFile(event: Event): void {
        const input = event.target as HTMLInputElement;
        const file = input.files?.[0];
        if (file) this.control.setValue(file);
    }
}
