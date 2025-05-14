import {
    Component,
    DestroyRef,
    EventEmitter,
    Input,
    OnChanges,
    Output,
    SimpleChanges,
    inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
    FormBuilder,
    FormControl,
    FormGroup,
    ReactiveFormsModule,
} from '@angular/forms';
import { DesignMeta, VariantMeta } from '@core/catalog/design.types';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
    selector: 'app-entry-form',
    standalone: true,
    templateUrl: './entry-form.component.html',
    styleUrls: ['./entry-form.component.scss'],
    imports: [CommonModule, ReactiveFormsModule],
})
export class EntryFormComponent implements OnChanges {
    /* ---------- di (declare first) ---------- */
    private readonly fb = inject(FormBuilder);
    private readonly destroyRef = inject(DestroyRef);

    /* ---------- inputs ---------- */
    @Input({ required: true }) design!: DesignMeta;
    @Input() variant: VariantMeta | null = null;
    @Input() initialForm: FormGroup | null = null;

    /* ---------- outputs ---------- */
    @Output() formChange = new EventEmitter<FormGroup>();

    /* ---------- public state ---------- */
    form: FormGroup = this.fb.group({});
    imagePreviews: Record<string, string> = {};

    /* ---------- lifecycle ---------- */
    ngOnChanges(changes: SimpleChanges): void {
        if (
            changes['variant'] ||
            changes['design'] ||
            changes['initialForm']
        ) {
            this.initForm();
        }
    }

    /* ===============================================================
       initForm(): one‑time form & subscription initialization
       =============================================================== */
    private initForm(): void {
        const fields = this.variant?.fields ?? this.design?.fields ?? [];
        const controls: Record<string, FormControl> = {};

        for (const field of fields) {
            const value = this.initialForm?.get(field.name)?.value ?? null;
            controls[field.name] = new FormControl(value);
        }

        this.form = this.fb.group(controls);

        /* emit only on user edits (avoids infinite loop) */
        this.form.valueChanges
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe(() => this.formChange.emit(this.form));
    }

    /* ---------- helpers ---------- */
    onFileChange(event: Event, fieldName: string): void {
        const file = (event.target as HTMLInputElement).files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = () =>
            (this.imagePreviews[fieldName] = reader.result as string);
        reader.readAsDataURL(file);
    }

    onMultiSelectChange(event: Event, fieldName: string): void {
        const input = event.target as HTMLInputElement;
        const current = this.form.get(fieldName)?.value ?? [];
        const updated = input.checked
            ? [...current, input.value]
            : current.filter((v: string) => v !== input.value);

        this.form.get(fieldName)?.setValue(updated);
    }
}
