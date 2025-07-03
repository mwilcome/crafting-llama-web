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
import { FieldDefEditorComponent } from '../ui/field-def-editor.component';

/* ---------- typed helpers ---------- */
interface OptionControls {
    label: FormControl<string>;
    value: FormControl<string>;
}
type OptionFG = FormGroup<OptionControls>;

interface FieldControls {
    key: FormControl<string>;
    label: FormControl<string>;
    type: FormControl<FieldDef['type']>;
    required: FormControl<boolean>;
    placeholder: FormControl<string>;
    multiselect: FormControl<boolean>;
    options: FormArray<OptionFG>;
}
type FieldFG = FormGroup<FieldControls>;

interface VariantControls {
    id: FormControl<string>;
    name: FormControl<string>;
    price: FormControl<number>;
    heroImage: FormControl<string>;
    description: FormControl<string>;
    fields: FormArray<FieldFG>;
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
        FieldDefEditorComponent,
    ],
})
export class CustomPageComponent {
    private fb = inject(FormBuilder);
    private designSvc = inject(DesignService);

    /* ──────── main form ──────── */
    form = this.fb.nonNullable.group({
        id: this.fb.nonNullable.control<string>(crypto.randomUUID()),
        name: this.fb.nonNullable.control('', Validators.required),
        description: this.fb.nonNullable.control(''),
        heroImage: this.fb.nonNullable.control(''),
        priceFrom: this.fb.nonNullable.control(0, Validators.min(0)),
        tags: this.fb.nonNullable.control(''),
        fields: this.fb.nonNullable.array<FieldFG>([]),      // global fields
        variants: this.fb.nonNullable.array<VariantFG>([]),  // 0-N variants
    });

    /* easy accessors */
    get variants(): FormArray<VariantFG> {
        return this.form.controls.variants;
    }
    get fields(): FormArray<FieldFG> {
        return this.form.controls.fields;
    }

    /* ──────── image staging ──────── */
    private heroFile: File | null = null;
    async onHeroSelected(file: File): Promise<void> {
        this.heroFile = file;                                 // keep locally
        this.form.patchValue({ heroImage: URL.createObjectURL(file) }); // local preview
    }

    /* ──────── variant helpers ──────── */
    addVariant(): void {
        this.variants.push(
            this.fb.nonNullable.group<VariantControls>({
                id: this.fb.nonNullable.control<string>(crypto.randomUUID()),
                name: this.fb.nonNullable.control('', Validators.required),
                price: this.fb.nonNullable.control(0, Validators.min(0)),
                heroImage: this.fb.nonNullable.control(''),
                description: this.fb.nonNullable.control(''),
                fields: this.fb.nonNullable.array<FieldFG>([]),
            }),
        );
    }
    removeVariant(i: number): void {
        this.variants.removeAt(i);            // **no** auto-re-add → allows 0 variants
    }

    /* ──────── live preview signal ──────── */
    private raw$ = toSignal(
        this.form.valueChanges.pipe(startWith(this.form.getRawValue())),
        { initialValue: this.form.getRawValue() },
    );

    preview = computed<Design>(() => {
        const raw = this.raw$();

        const mapField = (f: any): FieldDef => ({
            key: f.key,
            label: f.label,
            type: f.type,
            required: f.required ?? false,
            placeholder: f.placeholder ?? '',
            multiselect: f.multiselect ?? false,
            options: (f.options ?? []).map((o: any) => ({
                label: o.label,
                value: o.value,
            })),
        });

        return {
            id: raw.id!,
            name: raw.name!,
            description: raw.description ?? '',
            heroImage: raw.heroImage ?? '',
            priceFrom: raw.priceFrom ?? 0,
            tags: (raw.tags ?? '')
                .split(',')
                .map(t => t.trim())
                .filter(Boolean),
            fields: (raw.fields ?? []).map(mapField),
            variants: (raw.variants ?? []).map(v => ({
                id: v.id!,
                name: v.name!,
                description: v.description ?? '',
                price: v.price ?? 0,
                heroImage: v.heroImage ?? '',
                fields: (v.fields ?? []).map(mapField),
            })),
        };
    });

    /* ──────── persist ──────── */
    async save(): Promise<void> {
        if (this.form.invalid) {
            this.form.markAllAsTouched();
            return;
        }

        const design = this.preview();

        /* upload hero image only now */
        if (this.heroFile) {
            design.heroImage = await this.designSvc.uploadHeroImage(
                this.heroFile,
                design.id,
            );
        }

        await this.designSvc.upsertDesign(design);
        alert('Design saved ✔');
        this.resetForm();
    }

    private resetForm(): void {
        this.form.reset();
        this.heroFile = null;
        this.variants.clear();
        this.fields.clear();
        this.form.patchValue({
            id: crypto.randomUUID(),
            priceFrom: 0,
        });
    }
}
