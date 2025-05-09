import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import {
    CustomOrderService,
    FormField,
    ThreadColor,
    CustomFormDefinition
} from './custom-order.service';

@Component({
    selector: 'app-custom-order',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule],
    templateUrl: './custom-order.component.html',
    styleUrls: ['./custom-order.component.css']
})
export class CustomOrderComponent implements OnInit {
    /** UI state **/
    formOpen = true;
    designTypes: string[] = [];
    selectedType: string | null = null;
    showReview = false;

    /** Data **/
    form!: FormGroup;
    formDefinition: CustomFormDefinition | null = null;
    threadColors: ThreadColor[] = [];

    /** Feedback **/
    submitted = false;
    successMessage = '';

    constructor(
        private orderService: CustomOrderService,
        private fb: FormBuilder
    ) {}

    /* ------------------------- lifecycle ------------------------- */
    ngOnInit(): void {
        this.form = this.fb.group({});                           // safe lazy init
        this.orderService.isFormOpen().subscribe(open => (this.formOpen = open));
        this.orderService.getDesignTypes().subscribe(t => (this.designTypes = t));
        this.orderService.getAvailableThreadColors().subscribe(c => (this.threadColors = c));
    }

    /* ------------------------- design selection ------------------------- */
    selectDesignType(type: string): void {
        this.selectedType = type;
        this.showReview = false;
        this.orderService.getFormDefinition(type).subscribe(def => {
            this.formDefinition = def;
            this.buildForm(def.fields);
        });
    }

    /* ------------------------- dynamic form build ------------------------- */
    buildForm(fields: FormField[]): void {
        const group: Record<string, any> = {};
        fields.forEach(f => {
            const base = f.type === 'multiselect' ? [] : '';
            group[f.name] = f.required ? [base, Validators.required] : [base];
        });
        this.form = this.fb.group(group);
        this.submitted = false;
    }

    /* ------------------------- multiselect helper ------------------------- */
    onMultiSelectChange(event: Event, name: string): void {
        const input = event.target as HTMLInputElement;
        const current: string[] = this.form.get(name)?.value ?? [];
        this.form.get(name)?.setValue(
            input.checked ? [...current, input.value] : current.filter(v => v !== input.value)
        );
    }

    /* ------------------------- file helper ------------------------- */
    onFileChange(event: Event, name: string): void {
        const input = event.target as HTMLInputElement;
        if (input.files?.length) this.form.patchValue({ [name]: input.files[0] });
    }

    /* ------------------------- navigation buttons ------------------------- */
    next(): void {
        this.submitted = true;
        if (this.form.invalid) return;
        this.showReview = true;
    }

    backToEdit(): void {
        this.showReview = false;
    }

    confirm(): void {
        const payload = { designName: this.formDefinition!.designName, ...this.form.value };
        this.orderService.submitCustomOrder(payload).subscribe(res => {
            this.successMessage = res.message ?? 'Order received!';
            this.showReview = false;
            this.selectedType = null;
            this.form.reset();
            this.submitted = false;
        });
    }
}
