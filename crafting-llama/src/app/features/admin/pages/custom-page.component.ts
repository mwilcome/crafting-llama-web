import { Component, effect, inject, signal } from '@angular/core';
import {
    FormArray,
    FormBuilder,
    FormControl,
    FormGroup,
    ReactiveFormsModule,
    Validators,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { DesignService } from '@core/catalog/design.service';
import { Design, FieldDef } from '@core/catalog/design.types';
import { DesignCardComponent } from '@shared/ui/card/design-card.component';

type VariantFG = FormGroup<{
    id: FormControl<string>;
    name: FormControl<string>;
    price: FormControl<number>;
    heroImage: FormControl<string>;
    description: FormControl<string>;
}>;

@Component({
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, DesignCardComponent],
    selector: 'app-custom-page',
    templateUrl: './custom-page.component.html',
})
export class CustomPageComponent {
    private fb = inject(FormBuilder);
    private designSvc = inject(DesignService);

    form = this.fb.nonNullable.group({
        id: this.fb.nonNullable.control<string>(crypto.randomUUID()),
        name: this.fb.nonNullable.control('', Validators.required),
        description: this.fb.nonNullable.control(''),
        heroImage: this.fb.nonNullable.control(''),
        priceFrom: this.fb.nonNullable.control(0, Validators.min(0)),
        tags: this.fb.nonNullable.control(''),
        variants: this.fb.nonNullable.array<VariantFG>([]),
    });

    get variants(): FormArray<VariantFG> {
        return this.form.controls.variants;
    }

    addVariant(): void {
        this.variants.push(
            this.fb.nonNullable.group({
                id: this.fb.nonNullable.control<string>(crypto.randomUUID()),
                name: this.fb.nonNullable.control('', Validators.required),
                price: this.fb.nonNullable.control(0, Validators.min(0)),
                heroImage: this.fb.nonNullable.control(''),
                description: this.fb.nonNullable.control(''),
            }),
        );
    }

    removeVariant(i: number): void {
        this.variants.removeAt(i);
    }

    private _preview = signal<Design | null>(null);
    readonly preview = this._preview.asReadonly();

    constructor() {
        effect(() => {
            const raw = this.form.getRawValue();
            const design: Design = {
                id: raw.id,
                name: raw.name,
                description: raw.description,
                heroImage: raw.heroImage,
                priceFrom: raw.priceFrom,
                tags: raw.tags
                    .split(',')
                    .map(t => t.trim())
                    .filter(Boolean),
                fields: [] as FieldDef[],
                variants: raw.variants.map(v => ({
                    id: v.id,
                    name: v.name,
                    description: v.description,
                    price: v.price,
                    heroImage: v.heroImage,
                    fields: [] as FieldDef[],
                })),
            };
            this._preview.set(design);
        });

        this.addVariant();
    }

    async save(): Promise<void> {
        if (this.form.invalid) {
            this.form.markAllAsTouched();
            return;
        }

        console.log('Design payload', this.form.getRawValue());
        alert('Design form is valid; hook up save logic next.');
    }
}
