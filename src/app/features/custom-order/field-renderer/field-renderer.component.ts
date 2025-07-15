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

    protected get control(): FormControl {
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

    private hexToRgb(hex: string): { r: number; g: number; b: number } {
        hex = hex.replace('#', '');
        let r = 0, g = 0, b = 0;
        if (hex.length === 3) {
            r = parseInt(hex[0] + hex[0], 16);
            g = parseInt(hex[1] + hex[1], 16);
            b = parseInt(hex[2] + hex[2], 16);
        } else if (hex.length === 6) {
            r = parseInt(hex.slice(0, 2), 16);
            g = parseInt(hex.slice(2, 4), 16);
            b = parseInt(hex.slice(4, 6), 16);
        }
        return { r, g, b };
    }

    private getHsl(hex: string): { h: number; s: number; l: number } {
        let { r, g, b } = this.hexToRgb(hex);
        r /= 255;
        g /= 255;
        b /= 255;
        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        let h = 0, s = 0;
        const l = (max + min) / 2;
        if (max !== min) {
            const d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            switch (max) {
                case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                case g: h = (b - r) / d + 2; break;
                case b: h = (r - g) / d + 4; break;
            }
            h *= 60;
        }
        return { h, s, l };
    }

    private getHue(hex: string): number {
        return this.getHsl(hex).h;
    }

    private getSaturation(hex: string): number {
        return this.getHsl(hex).s;
    }

    private getLightness(hex: string): number {
        return this.getHsl(hex).l;
    }

    get sortedOptions(): FieldDef['options'] {
        if (this.field.type !== 'color' || !this.field.options) {
            return this.field.options;
        }
        return [...this.field.options].sort((a, b) => {
            const sa = this.getSaturation(a.value);
            const sb = this.getSaturation(b.value);
            const isGrayA = sa < 0.05; // Threshold for grayscale
            const isGrayB = sb < 0.05;
            if (isGrayA && !isGrayB) return 1; // Grays last
            if (!isGrayA && isGrayB) return -1;
            if (isGrayA && isGrayB) {
                return this.getLightness(a.value) - this.getLightness(b.value); // Dark to light for grays
            }
            const ha = this.getHue(a.value);
            const hb = this.getHue(b.value);
            if (ha !== hb) return ha - hb; // Ascending hue for rainbow order
            return this.getLightness(b.value) - this.getLightness(a.value); // Light to dark within hue
        });
    }
}
