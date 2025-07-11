import { Component, inject, Input } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { FieldDef } from '@core/catalog/design.types';
import { ColorService } from '@core/catalog/color.service';

@Component({
    selector: 'app-field-renderer',
    standalone: true,
    imports: [ReactiveFormsModule],
    templateUrl: './field-renderer.component.html',
    styleUrls: ['./field-renderer.component.scss'],
})
export class FieldRendererComponent {
    @Input({ required: true }) field!: FieldDef;
    @Input({ required: true }) form!: FormGroup;
    @Input({ required: true }) showErrors!: (fieldKey: string) => boolean;

    private readonly colorService = inject(ColorService);
    private readonly colorCache = new Map<string, string | null>();

    previewUrl: string | null = null;

    private get control(): FormControl {
        return this.form.get(this.field.key) as FormControl;
    }

    get ready(): boolean {
        return this.form?.contains(this.field.key);
    }

    getColorName(hex: string): string | null {
        if (!this.colorCache.has(hex)) {
            const name = this.colorService.getColorName(hex);
            this.colorCache.set(hex, name);
        }
        return this.colorCache.get(hex)!;
    }

    handleFile(event: Event): void {
        const file = (event.target as HTMLInputElement).files?.[0];
        if (file) {
            this.control.setValue(file);
            this.previewUrl = URL.createObjectURL(file);
        }
    }

    private get currentValues(): string[] {
        const raw = this.control.value;
        return Array.isArray(raw) ? raw : [];
    }

    getCheckboxValue(value: string): boolean {
        return this.currentValues.includes(value);
    }

    toggleCheckbox(value: string): void {
        const next = new Set(this.currentValues);
        next.has(value) ? next.delete(value) : next.add(value);

        this.control.setValue([...next]);
        this.control.markAsDirty();
    }
}
