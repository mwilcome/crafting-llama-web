import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CustomOrderService, FormField, ThreadColor, CustomFormDefinition } from './custom-order.service';

@Component({
    selector: 'app-custom-order',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule],
    templateUrl: './custom-order.component.html',
    styleUrls: ['./custom-order.component.css']
})
export class CustomOrderComponent implements OnInit {
    formOpen = true;
    designTypes: string[] = [];
    selectedType: string | null = null;
    formDefinition: CustomFormDefinition | null = null;
    form!: FormGroup;
    threadColors: ThreadColor[] = [];
    submitted = false;
    successMessage = '';

    constructor(private orderService: CustomOrderService, private fb: FormBuilder) {}

    ngOnInit(): void {
        this.form = this.fb.group({});
        this.orderService.isFormOpen().subscribe(open => (this.formOpen = open));
        this.orderService.getDesignTypes().subscribe(types => (this.designTypes = types));
        this.orderService.getAvailableThreadColors().subscribe(colors => (this.threadColors = colors));
    }


    selectDesignType(type: string): void {
        this.selectedType = type;
        this.orderService.getFormDefinition(type).subscribe(def => {
            this.formDefinition = def;
            this.buildForm(def.fields);
        });
    }

    buildForm(fields: FormField[]): void {
        const group: any = {};
        fields.forEach(field => {
            group[field.name] = [''];
        });
        this.form = this.fb.group(group);
    }

    onMultiSelectChange(event: Event, name: string): void {
        const input = event.target as HTMLInputElement;
        const selected = this.form.get(name)?.value || [];
        if (input.checked) {
            this.form.get(name)?.setValue([...selected, input.value]);
        } else {
            this.form.get(name)?.setValue(selected.filter((v: string) => v !== input.value));
        }
    }

    onFileChange(event: Event, fieldName: string): void {
        const input = event.target as HTMLInputElement;
        if (input.files?.length) {
            const file = input.files[0];
            this.form.patchValue({ [fieldName]: file });
        }
    }

    submit(): void {
        this.submitted = true;
        if (this.form.invalid || !this.formDefinition) return;

        const payload = {
            designName: this.formDefinition.designName,
            ...this.form.value
        };

        this.orderService.submitCustomOrder(payload).subscribe(res => {
            this.successMessage = res.message || 'Order submitted!';
            this.form.reset();
            this.submitted = false;
        });
    }
}
