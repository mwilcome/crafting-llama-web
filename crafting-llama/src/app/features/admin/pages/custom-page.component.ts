import {
    Component,
    inject,
    signal,
    computed,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import {
    FormArray,
    FormBuilder,
    FormControl,
    FormGroup,
    ReactiveFormsModule,
    Validators,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { startWith } from 'rxjs';
import { DesignService } from '@core/catalog/design.service';
import { Design, FieldDef } from '@core/catalog/design.types';
import { ImageUploadComponent } from '../ui/image-upload.component';
import { DesignPreviewComponent } from '../ui/design-preview.component';

interface VariantControls {
    id: FormControl<string>;
    name: FormControl<string>;
    price: FormControl<number>;
    heroImage: FormControl<string>;
    description: FormControl<string>;
}
type VariantFG = FormGroup<VariantControls>;

@Component({
    standalone: true,
    selector: 'app-custom-page',
    templateUrl: './custom-page.component.html',
    imports: [
        CommonModule,
        ReactiveFormsModule,
        ImageUploadComponent,
        DesignPreviewComponent,
    ],
})
export class CustomPageComponent {
    /* ───────── form setup ───────── */
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
            this.fb.nonNullable.group<VariantControls>({
                id: this.fb.nonNullable.control<string>(crypto.randomUUID()),
                name: this.fb.nonNullable.control('', Validators.required),
                price: this.fb.nonNullable.control(0, Validators.min(0)),
                heroImage: this.fb.nonNullable.control(''),
                description: this.fb.nonNullable.control(''),
            }) as VariantFG,
        );
    }

    removeVariant(i: number): void {
        this.variants.removeAt(i);
    }

    /* ───────── form → signal → preview ───────── */
    private raw$ = toSignal(
        this.form.valueChanges.pipe(startWith(this.form.getRawValue())),
        { initialValue: this.form.getRawValue() },
    );

    preview = computed<Design>(() => {
        const raw = this.raw$();

        return {
            id: raw.id!,
            name: raw.name!,
            description: raw.description ?? '',
            heroImage: raw.heroImage ?? '',
            priceFrom: raw.priceFrom ?? 0,
            tags: (raw.tags ?? '')
                .split(',')
                .map((t: string) => t.trim())
                .filter(Boolean),
            fields: [] as FieldDef[],
            variants: (raw.variants ?? []).map((v) => ({
                id: v.id!,
                name: v.name!,
                description: v.description ?? '',
                price: v.price ?? 0,
                heroImage: v.heroImage ?? '',
                fields: [] as FieldDef[],
            })),
        };
    });

    /* ───────── image upload helper ───────── */
    async onHeroSelected(file: File): Promise<void> {
        const url = await this.designSvc.uploadHeroImage(
            file,
            this.form.controls.id.value,
        );
        this.form.patchValue({ heroImage: url });
    }

    /* ───────── persist design ───────── */
    async save(): Promise<void> {
        if (this.form.invalid) {
            this.form.markAllAsTouched();
            return;
        }
        await this.designSvc.upsertDesign(this.preview());
        alert('Design saved ✔');

        /* reset for next entry */
        this.form.reset();
        this.variants.clear();
        this.addVariant();
    }

    constructor() {
        this.addVariant(); // start with one variant row
    }
}
