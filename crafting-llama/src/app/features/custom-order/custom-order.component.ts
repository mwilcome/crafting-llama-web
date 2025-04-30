import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CustomOrderService, CustomFormDefinition, ThreadColor, FormField } from './custom-order.service';
import { switchMap, tap } from 'rxjs/operators';

@Component({
    selector: 'app-custom-order',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule],
    templateUrl: './custom-order.component.html',
    styleUrls: ['./custom-order.component.css']
})
export class CustomOrderComponent implements OnInit {
    formOpen = true;
    productTypes: string[] = [];
    selectedType: string | null = null;
    formDefinition: CustomFormDefinition | null = null;
    threadColors: ThreadColor[] = [];
    submitted = false;
    successMessage = '';
    form!: FormGroup;

    constructor(private orderService: CustomOrderService, private fb: FormBuilder) {}

    ngOnInit(): void {
        this.form = this.fb.group({});
        this.orderService.isFormOpen().pipe(
            tap(open => this.formOpen = open),
            switchMap(() => this.orderService.getProductTypes())
        ).subscribe(types => this.productTypes = types);

        this.orderService.getAvailableThreadColors().subscribe(colors => {
            this.threadColors = colors;
        });
    }

    selectProductType(type: string): void {
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

    submit(): void {
        if (this.form.invalid || !this.formDefinition) return;
        const payload = {
            productType: this.formDefinition.productType,
            ...this.form.value
        };
        this.orderService.submitCustomOrder(payload).subscribe(res => {
            this.submitted = true;
            this.successMessage = res.message || 'Order submitted!';
            this.form.reset();
        });
    }

    onFileChange(event: Event, fieldName: string): void {
        const input = event.target as HTMLInputElement;
        if (input.files && input.files.length > 0) {
            const file = input.files[0];
            this.form.patchValue({ [fieldName]: file });
        }
    }

}
