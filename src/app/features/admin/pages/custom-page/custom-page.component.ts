import {
    Component,
    computed,
    inject,
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
import { ActivatedRoute, Router } from '@angular/router';
import { startWith } from 'rxjs';

import { DesignService } from '@core/catalog/design.service';
import { Design, FieldDef } from '@core/catalog/design.types';

import { ImageUploadComponent } from '../../ui/image-upload.component';
import { DesignPreviewComponent } from '../../ui/design-preview.component';
import { FieldDefEditorComponent } from '../../ui/field-def-editor.component';
import { ToastService } from '@shared/services/toast/toast.service';

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
    styleUrls: ['./custom-page.component.scss'],
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
    private toast = inject(ToastService);
    private route = inject(ActivatedRoute);
    private router = inject(Router);

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

    get variants(): FormArray<VariantFG> {
        return this.form.controls.variants;
    }

    get fields(): FormArray<FieldFG> {
        return this.form.controls.fields;
    }

    private heroFile: File | null = null;
    private variantHeroFiles = new Map<string, File>();

    constructor() {
        const id = this.route.snapshot.paramMap.get('id');
        if (id && id !== 'new') this.loadDesign(id);
    }

    private createOption(o?: { label: string; value: string }): OptionFG {
        return this.fb.nonNullable.group({
            label: this.fb.nonNullable.control(o?.label ?? ''),
            value: this.fb.nonNullable.control(o?.value ?? ''),
        });
    }

    private createField(f?: FieldDef): FieldFG {
        return this.fb.nonNullable.group({
            key: this.fb.nonNullable.control(f?.key ?? ''),
            label: this.fb.nonNullable.control(f?.label ?? ''),
            type: this.fb.nonNullable.control(f?.type as FieldDef['type']),
            required: this.fb.nonNullable.control(!!f?.required),
            placeholder: this.fb.nonNullable.control(f?.placeholder ?? ''),
            options: this.fb.nonNullable.array<OptionFG>(
                (f?.options ?? []).map((o) => this.createOption(o)),
            ),
        });
    }

    private createVariant(v?: any): VariantFG {
        return this.fb.nonNullable.group({
            id: this.fb.nonNullable.control(v?.id ?? crypto.randomUUID()),
            name: this.fb.nonNullable.control(v?.name ?? '', Validators.required),
            price: this.fb.nonNullable.control(v?.price ?? 0, Validators.min(0)),
            heroImage: this.fb.nonNullable.control(v?.heroImage ?? ''),
            description: this.fb.nonNullable.control(v?.description ?? ''),
            fields: this.fb.nonNullable.array<FieldFG>(
                (v?.fields ?? []).map((f: FieldDef) => this.createField(f)),
            ),
        });
    }

    private async loadDesign(id: string) {
        const d = await this.designSvc.getDesign(id);
        if (!d) return;
        this.heroFile = null;
        this.variantHeroFiles.clear();
        this.fields.clear();
        this.variants.clear();
        d.fields.forEach((f) => this.fields.push(this.createField(f)));
        d.variants?.forEach((v) => this.variants.push(this.createVariant(v)));
        this.form.patchValue({
            id: d.id,
            name: d.name,
            description: d.description,
            heroImage: d.heroImage,
            priceFrom: d.priceFrom,
            tags: d.tags.join(','),
        });
    }

    onHeroSelected(file: File) {
        this.heroFile = file;
        this.form.patchValue({ heroImage: URL.createObjectURL(file) });
    }

    onVariantHeroSelected(i: number, file: File) {
        const ctrl = this.variants.at(i);
        ctrl.patchValue({ heroImage: URL.createObjectURL(file) });
        this.variantHeroFiles.set(ctrl.controls.id.value, file);
    }

    addVariant() {
        this.variants.push(this.createVariant());
    }

    removeVariant(i: number) {
        const id = this.variants.at(i).controls.id.value;
        this.variantHeroFiles.delete(id);
        this.variants.removeAt(i);
    }

    addVariantField(ctrl: VariantFG) {
        ctrl.controls.fields.push(this.createField());
    }

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
            options: (f.options ?? []).map((o: any) => ({ label: o.label, value: o.value })),
        });
        return {
            id: raw.id!,
            name: raw.name!,
            description: raw.description ?? '',
            heroImage: raw.heroImage ?? '',
            priceFrom: raw.priceFrom ?? 0,
            tags: (raw.tags ?? '').split(',').map((t) => t.trim()).filter(Boolean),
            fields: (raw.fields ?? []).map(mapField),
            variants: (raw.variants ?? []).map((v: any) => ({
                id: v.id!,
                name: v.name!,
                description: v.description ?? '',
                price: v.price ?? 0,
                heroImage: v.heroImage ?? '',
                fields: (v.fields ?? []).map(mapField),
            })),
        };
    });

    async save() {
        if (this.form.invalid) {
            this.form.markAllAsTouched();
            return;
        }
        const design = this.preview();
        if (this.heroFile)
            design.heroImage = await this.designSvc.uploadHeroImage(this.heroFile, design.id);
        for (const v of design.variants ?? []) {
            const f = this.variantHeroFiles.get(v.id);
            if (f) v.heroImage = await this.designSvc.uploadHeroImage(f, v.id);
        }
        await this.designSvc.upsertDesign(design);
        await this.router.navigate(['../designs'], { relativeTo: this.route });
        this.toast.show('Design saved', { type: 'success' });
    }
}
