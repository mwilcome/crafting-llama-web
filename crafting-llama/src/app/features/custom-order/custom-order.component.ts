import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize } from 'rxjs';

import { LoaderService } from '@core/loader/loader.service';
import { ToastService } from '@core/toast/toast.service';
import { DesignService, VariantMeta, Design, FieldDefinition } from '@core/design/design.service';
import { CustomOrderService, ThreadColor } from './custom-order.service';
import { DesignCardComponent } from './design-card.component';

@Component({
    selector: 'app-custom-order',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, DesignCardComponent],
    templateUrl: './custom-order.component.html',
    styleUrls: ['./custom-order.component.css']
})
export class CustomOrderComponent implements OnInit {
    formOpen = true;
    designs: Design[] = [];
    selectedDesign: Design | null = null;
    selectedVariant: VariantMeta | null = null;

    form!: FormGroup;
    threadColors: ThreadColor[] = [];

    submitted = false;
    successMessage = '';
    orderId = '';
    emailSent = false;
    private _showReview = false;

    constructor(
        private designService: DesignService,
        private orderService: CustomOrderService,
        private fb: FormBuilder,
        private loader: LoaderService,
        private toast: ToastService
    ) {}

    ngOnInit(): void {
        this.form = this.fb.group({});
        this.orderService.isFormOpen().subscribe(o => (this.formOpen = o));
        this.orderService.getAvailableThreadColors().subscribe(c => (this.threadColors = c));
        this.designService.getDesigns().subscribe(d => (this.designs = d));
    }

    selectDesignType(design: Design) {
        this.selectedDesign = design;

        if (!design.variants) {
            this.selectedVariant = {
                ...design,
                id: design.id + '-default',
                fields: design.fields ?? []
            };
            this.buildForm(this.selectedVariant.fields);
        }
    }

    selectVariant(v: VariantMeta): void {
        this.selectedVariant = v;
        this.buildForm(v.fields ?? []);
    }

    private buildForm(fields: FieldDefinition[]): void {
        const group: Record<string, any> = {};
        fields.forEach(f => {
            const base = f.type === 'multiselect' ? [] : '';
            group[f.name] = f.required ? [base, Validators.required] : [base];
        });
        this.form = this.fb.group(group);
        this.submitted = false;
    }

    onMultiSelectChange(e: Event, name: string): void {
        const input = e.target as HTMLInputElement;
        const current = this.form.get(name)?.value ?? [];
        this.form.get(name)?.setValue(
            input.checked ? [...current, input.value] : current.filter((v: string) => v !== input.value)
        );
    }

    onFileChange(e: Event, name: string): void {
        const input = e.target as HTMLInputElement;
        if (input.files?.length) this.form.patchValue({ [name]: input.files[0] });
    }

    next(): void {
        this.submitted = true;
        if (this.form.invalid) return;
        this.showReview = true;
    }

    backToEdit(): void {
        this.showReview = false;
    }

    confirm(): void {
        const payload = {
            designName: this.selectedVariant?.name ?? this.selectedDesign?.name,
            ...this.form.value
        };

        this.loader.show();
        this.orderService
            .submitCustomOrder(payload)
            .pipe(finalize(() => this.loader.hide()))
            .subscribe({
                next: res => {
                    this.orderId = res.orderId ?? '';
                    this.emailSent = res.emailSent ?? false;
                    this.successMessage = res.message ?? 'Order received!';
                    this.toast.show(this.successMessage, { type: 'success' });
                    this.reset();
                },
                error: () => this.toast.show('Something went wrong. Please try again.', { type: 'error' })
            });
    }

    private reset(): void {
        this.form.reset();
        this.selectedDesign = null;
        this.selectedVariant = null;
        this.submitted = false;
        this.showReview = false;
    }

    newOrder(): void {
        this.reset();
        this.formOpen = true;
    }

    get showReview(): boolean {
        return this._showReview;
    }
    set showReview(val: boolean) {
        this._showReview = val;
    }
}
