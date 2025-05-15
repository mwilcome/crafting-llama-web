import {
    Component,
    Input,
    Output,
    EventEmitter,
    OnChanges,
    SimpleChanges,
    inject
} from '@angular/core';
import {
    FormBuilder,
    FormGroup,
    ReactiveFormsModule,
    FormsModule
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Design, Variant, FieldDefinition } from '@core/catalog/design.types';

@Component({
    selector: 'app-entry-form',
    standalone: true,
    templateUrl: './entry-form.component.html',
    styleUrls: ['./entry-form.component.scss'],
    imports: [CommonModule, ReactiveFormsModule, FormsModule]
})
export class EntryFormComponent implements OnChanges {
    @Input() design!: Design;
    @Input() variant: Variant | null = null;
    @Input() initialForm: FormGroup | null = null;

    @Output() formChange = new EventEmitter<FormGroup>();

    form!: FormGroup;
    imagePreviews: Record<string, string> = {};

    private readonly fb = inject(FormBuilder);

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['design'] || changes['variant']) {
            this.buildForm();
        }
    }

    private buildForm() {
        const fields = this.variant?.fields ?? this.design.fields ?? [];
        const group: Record<string, any> = {};

        for (const field of fields) {
            const defaultValue =
                this.initialForm?.get(field.name)?.value ?? this.getDefaultValue(field);
            group[field.name] = [defaultValue];
        }

        this.form = this.fb.group(group);
        this.formChange.emit(this.form);
    }

    private getDefaultValue(field: FieldDefinition): any {
        if (field.type === 'multiselect') return [];
        if (field.type === 'file') return null;
        return '';
    }

    onFileChange(event: Event, name: string) {
        const input = event.target as HTMLInputElement;
        if (!input.files?.length) return;

        const file = input.files[0];
        const reader = new FileReader();
        reader.onload = () => {
            this.imagePreviews[name] = reader.result as string;
            this.form.get(name)?.setValue(reader.result);
        };
        reader.readAsDataURL(file);
    }

    onMultiSelectChange(event: Event, name: string) {
        const input = event.target as HTMLInputElement;
        const value = input.value;
        const current: string[] = this.form.get(name)?.value || [];
        const updated = input.checked
            ? [...current, value]
            : current.filter(v => v !== value);
        this.form.get(name)?.setValue(updated);
    }
}
