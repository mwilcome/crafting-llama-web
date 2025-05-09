import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import {
    CustomOrderService,
    FormField,
    ThreadColor,
    CustomFormDefinition
} from './custom-order.service';
import {LoaderService} from "@core/loader.service";
import {finalize} from "rxjs";

@Component({
    selector: 'app-custom-order',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule],
    templateUrl: './custom-order.component.html',
    styleUrls: ['./custom-order.component.css']
})
export class CustomOrderComponent implements OnInit {
    /* ------------ UI state ------------ */
    formOpen      = true;
    designTypes   : string[] = [];
    selectedType  : string | null = null;
    showReview    = false;

    /* ------------ Data ------------ */
    form!         : FormGroup;
    formDefinition: CustomFormDefinition | null = null;
    threadColors  : ThreadColor[] = [];

    /* ------------ Feedback / confirmation ------------ */
    submitted      = false;
    successMessage = '';
    orderId        = '';     // NEW
    emailSent      = false;  // NEW

    constructor(
        private orderService: CustomOrderService,
        private fb: FormBuilder,
        private loader: LoaderService
    ) {}

    /* -------- lifecycle -------- */
    ngOnInit(): void {
        this.form = this.fb.group({});           // safe lazy init
        this.orderService.isFormOpen().subscribe(o => (this.formOpen = o));
        this.orderService.getDesignTypes().subscribe(t => (this.designTypes = t));
        this.orderService.getAvailableThreadColors().subscribe(c => (this.threadColors = c));
    }

    /* -------- design selection -------- */
    selectDesignType(type: string): void {
        this.selectedType = type;
        this.showReview   = false;
        this.orderService.getFormDefinition(type).subscribe(def => {
            this.formDefinition = def;
            this.buildForm(def.fields);
        });
    }

    /* -------- dynamic form build -------- */
    buildForm(fields: FormField[]): void {
        const group: Record<string, any> = {};
        fields.forEach(f => {
            const base = f.type === 'multiselect' ? [] : '';
            group[f.name] = f.required ? [base, Validators.required] : [base];
        });
        this.form = this.fb.group(group);
        this.submitted = false;
    }

    /* -------- helpers -------- */
    onMultiSelectChange(e: Event, name: string): void {
        const input   = e.target as HTMLInputElement;
        const current = this.form.get(name)?.value ?? [];
        this.form.get(name)?.setValue(
            input.checked ? [...current, input.value] : current.filter((v: string) => v !== input.value)
        );
    }

    onFileChange(e: Event, name: string): void {
        const input = e.target as HTMLInputElement;
        if (input.files?.length) this.form.patchValue({ [name]: input.files[0] });
    }

    /* -------- nav buttons -------- */
    next(): void {
        this.submitted = true;
        if (this.form.invalid) return;
        this.showReview = true;
    }

    backToEdit(): void {
        this.showReview = false;
    }

    confirm(): void {
        const payload = {designName: this.formDefinition!.designName, ...this.form.value};

        this.loader.show();
        this.orderService.submitCustomOrder(payload).pipe(
            finalize(() => this.loader.hide())             // stop spinner after success OR error
        )
            .subscribe(res => {
                this.orderId = res.orderId ?? '';
                this.emailSent = res.emailSent ?? false;
                this.successMessage = res.message ?? 'Order received!';

                /* reset UX */
                this.showReview = false;
                this.selectedType = null;
                this.form.reset();
                this.submitted = false;
            });
    }

    newOrder(): void {
        this.successMessage = '';
        this.orderId        = '';
        this.emailSent      = false;
        this.selectedType   = null;
        this.form.reset();
        this.submitted      = false;
    }
}
