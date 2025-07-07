import {
    Component, computed, inject, signal,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import {
    FormArray, FormBuilder, FormControl,
    FormGroup, ReactiveFormsModule, Validators,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { startWith } from 'rxjs';

import { DesignService } from '@core/catalog/design.service';
import { Design, FieldDef } from '@core/catalog/design.types';

import { ImageUploadComponent } from '../ui/image-upload.component';
import { DesignPreviewComponent } from '../ui/design-preview.component';
import { FieldDefEditorComponent } from '../ui/field-def-editor.component';

/* ---------- typed helpers ---------- */
interface OptionFG extends FormGroup<{
    label: FormControl<string>;
    value: FormControl<string>;
}> {}

interface FieldFG extends FormGroup<{
    key: FormControl<string>;
    label: FormControl<string>;
    type: FormControl<FieldDef['type']>;
    required: FormControl<boolean>;
    placeholder: FormControl<string>;
    options: FormArray<OptionFG>;
}> {}

interface VariantFG extends FormGroup<{
    id: FormControl<string>;
    name: FormControl<string>;
    price: FormControl<number>;
    heroImage: FormControl<string>;
    description: FormControl<string>;
    fields: FormArray<FieldFG>;
}> {}

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

    /* ——— services & helpers ——— */
    private fb = inject(FormBuilder);
    private designSvc = inject(DesignService);

    /* ——— form structure ——— */
    form = this.fb.nonNullable.group({
        id: this.fb.nonNullable.control<string>(crypto.randomUUID()),
        name: this.fb.nonNullable.control('', Validators.required),
        description: this.fb.nonNullable.control(''),
        heroImage: this.fb.nonNullable.control(''),
        priceFrom: this.fb.nonNullable.control(0, Validators.min(0)),
        tags: this.fb.nonNullable.control(''),
        fields: this.fb.nonNullable.array<FieldFG>([]),
        variants: this.fb.nonNullable.array<VariantFG>([]),
    });

    /* quick accessors */
    get variants(): FormArray<VariantFG> { return this.form.controls.variants; }
    get fields(): FormArray<FieldFG> { return this.form.controls.fields; }

    /* ——— hero files kept in memory until save ——— */
    private heroFile: File | null = null;
    private variantHeroFiles = new Map<string, File>();  // id → File

    onHeroSelected(file: File) {
        this.heroFile = file;
        this.form.patchValue({ heroImage: URL.createObjectURL(file) });
    }

    onVariantHeroSelected(i: number, file: File) {
        const ctrl = this.variants.at(i);
        ctrl.patchValue({ heroImage: URL.createObjectURL(file) });
        this.variantHeroFiles.set(ctrl.controls.id.value, file);
    }

    /* ——— variant array helpers ——— */
    addVariant() {
        this.variants.push(
            this.fb.nonNullable.group<VariantFG['controls']>({
                id: this.fb.nonNullable.control(crypto.randomUUID()),
                name: this.fb.nonNullable.control('', Validators.required),
                price: this.fb.nonNullable.control(0, Validators.min(0)),
                heroImage: this.fb.nonNullable.control(''),
                description: this.fb.nonNullable.control(''),
                fields: this.fb.nonNullable.array<FieldFG>([]),
            }),
        );
    }
    removeVariant(i: number) {
        const id = this.variants.at(i).controls.id.value;
        this.variantHeroFiles.delete(id);
        this.variants.removeAt(i);
    }

    /* ——— live preview as a computed signal ——— */
    private raw$ = toSignal(this.form.valueChanges.pipe(
        startWith(this.form.getRawValue()),
    ), { initialValue: this.form.getRawValue() });

    preview = computed<Design>(() => {
        const raw = this.raw$();
        const mapField = (f: any): FieldDef => ({
            key: f.key,
            label: f.label,
            type: f.type,
            required: f.required ?? false,
            placeholder: f.placeholder ?? '',
            options: (f.options ?? []).map((o: any) => ({ label: o.label, value: o.value })),
        });

        return {
            id: raw.id!,
            name: raw.name!,
            description: raw.description ?? '',
            heroImage: raw.heroImage ?? '',
            priceFrom: raw.priceFrom ?? 0,
            tags: (raw.tags ?? '').split(',').map(t => t.trim()).filter(Boolean),
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

    /* ——— save pipeline ——— */
    async save() {
        if (this.form.invalid) {
            this.form.markAllAsTouched();
            return;
        }

        const design = this.preview();

        /* upload design hero */
        if (this.heroFile) {
            design.heroImage = await this.designSvc.uploadHeroImage(
                this.heroFile, design.id,
            );
        }

        /* upload each variant hero */
        for (const v of design.variants ?? []) {
            const file = this.variantHeroFiles.get(v.id);
            if (file) {
                v.heroImage = await this.designSvc.uploadHeroImage(file, v.id);
            }
        }

        await this.designSvc.upsertDesign(design);
        alert('Design saved ✔');

        this.resetForm();
    }

    private resetForm() {
        this.form.reset();
        this.heroFile = null;
        this.variantHeroFiles.clear();
        this.variants.clear();
        this.fields.clear();
        this.form.patchValue({ id: crypto.randomUUID(), priceFrom: 0 });
    }
}
