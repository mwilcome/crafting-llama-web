import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize } from 'rxjs';

import { LoaderService } from '@core/loader/loader.service';
import { ToastService }  from '@core/toast/toast.service';
import { DesignService, DesignMeta } from '@core/design/design.service';
import { CustomOrderService, ThreadColor } from './custom-order.service';

import { DesignCardComponent } from './design-card.component';

@Component({
    selector   : 'app-custom-order',
    standalone : true,
    imports    : [CommonModule, ReactiveFormsModule, DesignCardComponent],
    templateUrl: './custom-order.component.html',
    styleUrls  : ['./custom-order.component.css']
})
export class CustomOrderComponent implements OnInit {

    /* ---------- UI state ---------- */
    formOpen     = true;
    selectedDesign: DesignMeta | null = null;
    showReview   = false;

    /* ---------- data ---------- */
    designs: DesignMeta[] = [];
    form!: FormGroup;
    threadColors: ThreadColor[] = [];

    /* ---------- feedback ---------- */
    submitted      = false;
    successMessage = '';
    orderId        = '';
    emailSent      = false;

    constructor(
        private designService: DesignService,
        private orderService : CustomOrderService,
        private fb           : FormBuilder,
        private loader       : LoaderService,
        private toast        : ToastService
    ) {}

    ngOnInit(): void {
        this.form = this.fb.group({});
        this.orderService.isFormOpen().subscribe(open => this.formOpen = open);
        this.orderService.getAvailableThreadColors().subscribe(c => this.threadColors = c);
        this.designService.getDesigns().subscribe(d => this.designs = d);
    }

    /* ---------- design selection ---------- */
    selectDesignType(d: DesignMeta): void {
        this.selectedDesign = d;
        this.orderId = this.successMessage = '';
        this.emailSent = false;
        this.buildForm(d.fields);
    }

    /* ---------- dynamic form ---------- */
    private buildForm(fields: any[]): void {
        const group: Record<string, any> = {};
        fields.forEach(f => {
            const base = f.type === 'multiselect' ? [] : '';
            group[f.name] = f.required ? [base, Validators.required] : [base];
        });
        this.form = this.fb.group(group);
        this.submitted = false;
    }

    /* ---------- helpers ---------- */
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

    /* ---------- nav ---------- */
    next(): void {
        this.submitted = true;
        if (this.form.invalid) return;
        this.showReview = true;
    }

    backToEdit(): void {
        this.showReview = false;
    }

    confirm(): void {
        const payload = { designName: this.selectedDesign!.name, ...this.form.value };

        this.loader.show();
        this.orderService.submitCustomOrder(payload)
            .pipe(finalize(() => this.loader.hide()))
            .subscribe({
                next : res => {
                    this.orderId        = res.orderId   ?? '';
                    this.emailSent      = res.emailSent ?? false;
                    this.successMessage = res.message   ?? 'Order received!';
                    this.toast.show(this.successMessage);

                    this.showReview    = false;
                    this.selectedDesign = null;
                    this.form.reset();
                    this.submitted     = false;
                },
                error: () => this.toast.show('Something went wrong. Please try again.')
            });
    }

    newOrder(): void {
        this.selectedDesign = null;
        this.successMessage = this.orderId = '';
        this.emailSent      = false;
        this.form.reset();
        this.submitted      = false;
    }
}
