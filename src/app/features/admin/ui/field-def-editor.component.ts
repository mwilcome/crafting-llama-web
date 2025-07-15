import { Component, Input, inject, DestroyRef, signal } from '@angular/core';
import {
    FormArray,
    FormBuilder,
    FormControl,
    FormGroup,
    ReactiveFormsModule,
    Validators,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FieldDef } from '@core/catalog/design.types';
import { ColorName } from '@core/catalog/color.types';
import { ColorService } from '@core/catalog/color.service';

const slug = (t: string) => t.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-');

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
    options: FormArray<OptionFG>;
}
export type FieldFG = FormGroup<FieldControls>;
type FieldType = FieldDef['type'];

@Component({
    standalone: true,
    selector: 'field-def-editor',
    templateUrl: './field-def-editor.component.html',
    styleUrls: ['./field-def-editor.component.scss'],
    imports: [CommonModule, ReactiveFormsModule],
})
export class FieldDefEditorComponent {
    @Input({ required: true }) array!: FormArray<FieldFG>;
    @Input() header = '';
    @Input() hideControls = false;

    readonly types: FieldType[] = [
        'text',
        'textarea',
        'checkbox',
        'dropdown',
        'radio',
        'file',
        'color',
        'hidden',
    ];

    readonly typeHints: Record<FieldType, string> = {
        text: 'Single-line text input',
        textarea: 'Multi-line text area',
        checkbox: 'Checkbox group',
        dropdown: 'Dropdown select',
        radio: 'Radio button group',
        file: 'File upload',
        color: 'Color picker',
        hidden: 'Hidden value (not shown to customer)',
    };

    private fb = inject(FormBuilder);
    private destroyRef = inject(DestroyRef);

    private readonly colorService = inject(ColorService);
    readonly availableColors = signal<ColorName[]>([]);

    constructor() {
        this.colorService.fetchColors().then(this.availableColors.set);
    }

    /** Builds “Name (#hex) – tag1, tag2” for the option label */
    colorLabel = (c: ColorName): string =>
        `${c.name} (${c.hex})${c.tags?.length ? ' – ' + c.tags.join(', ') : ''}`;

    /* ─────────────── field helpers ─────────────── */
    addField(): void {
        const fg = this.fb.nonNullable.group<FieldControls>({
            key: this.fb.nonNullable.control('', Validators.required),
            label: this.fb.nonNullable.control('', Validators.required),
            type: this.fb.nonNullable.control<'text'>('text'),
            required: this.fb.nonNullable.control(false),
            placeholder: this.fb.nonNullable.control(''),
            options: this.fb.nonNullable.array<OptionFG>([]),
        });

        fg.controls.label.valueChanges
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe((l) => {
                if (!fg.controls.key.touched) {
                    fg.controls.key.setValue(slug(l), { emitEvent: false });
                }
            });

        fg.controls.type.valueChanges
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe((type) => {
                const needsOptions = ['dropdown', 'radio', 'checkbox', 'color'].includes(type);
                if (needsOptions && fg.controls.options.length === 0) this.addOption(fg);
                if (!needsOptions) fg.setControl('options', this.fb.nonNullable.array<OptionFG>([]));
            });

        this.array.push(fg);
    }

    removeField(i: number)      { this.array.removeAt(i); }
    addOption(f: FieldFG): void { f.controls.options.push(this.fb.nonNullable.group<OptionControls>({
        label: this.fb.nonNullable.control(''),
        value: this.fb.nonNullable.control(''),
    })); }
    removeOption(f: FieldFG, i: number) { f.controls.options.removeAt(i); }
}
