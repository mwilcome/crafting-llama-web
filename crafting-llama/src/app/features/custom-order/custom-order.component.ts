import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { finalize } from 'rxjs';
import { Design, DesignService, FieldDefinition, VariantMeta } from '@core/design/design.service';
import { CustomOrderService, ThreadColor } from './custom-order.service';
import { LoaderService } from '@core/loader/loader.service';
import { ToastService } from '@core/toast/toast.service';
import { DesignCardComponent } from "@features/custom-order/design-card.component";
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from "@angular/router";

@Component({
    selector: 'app-custom-order',
    templateUrl: './custom-order.component.html',
    styleUrls: ['./custom-order.component.css'],
    standalone: true,
    imports: [
        DesignCardComponent,
        ReactiveFormsModule,
        CommonModule,
        RouterLink
    ]
})
export class CustomOrderComponent implements OnInit {
    formOpen = true;
    designs: Design[] = [];
    selectedDesign: Design | null = null;
    selectedVariant: VariantMeta | null = null;

    form!: FormGroup;
    threadColors: ThreadColor[] = [];
    imagePreviews: Record<string, string> = {};

    submitted = false;
    successMessage = '';
    orderId = '';
    emailSent = false;
    private _showReview = false;

    constructor(
        private designService: DesignService,
        private orderService: CustomOrderService,
        private loader: LoaderService,
        private toast: ToastService,
        private fb: FormBuilder
    ) {}

    ngOnInit(): void {
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
        this.selectedVariant = {
            ...v,
            fields: v.fields?.slice().sort((a, b) => a.name.localeCompare(b.name)) ?? []
        };
        this.buildForm(this.selectedVariant.fields);
    }

    private buildForm(fields: FieldDefinition[]): void {
        const group: Record<string, any> = {};

        fields.forEach(f => {
            const value = f.type === 'multiselect' ? [] : f.options?.[0] ?? '';
            const validators = f.required ? [Validators.required] : [];
            group[f.name] = new FormControl(value, validators);
        });

        this.form = this.fb.group(group);
        this.submitted = false;
        this.imagePreviews = {};

        // Ensure default value appears AFTER form is initialized
        if (this.form.get('numberOfFlowers')) {
            setTimeout(() => this.form.get('numberOfFlowers')?.setValue(1), 0);
        }
    }

    onMultiSelectChange(e: Event, name: string): void {
        const input = e.target as HTMLInputElement;
        const current = this.form.get(name)?.value ?? [];
        const updated = input.checked
            ? [...current, input.value]
            : current.filter((v: string) => v !== input.value);
        this.form.get(name)?.setValue(updated);
    }

    onFileChange(e: Event, name: string): void {
        const input = e.target as HTMLInputElement;
        if (input.files?.length) {
            const file = input.files[0];
            this.form.get(name)?.setValue(file);
            this.imagePreviews[name] = URL.createObjectURL(file);
        }
    }

    next(): void {
        this.submitted = true;
        if (this.form.invalid) {
            this.toast.show('Please complete all required fields.', { type: 'error' });
            return;
        }
        this.showReview = true;
    }

    backToEdit(): void {
        this.showReview = false;
    }

    confirm(): void {
        const payload = {
            designName: this.selectedVariant?.name ?? this.selectedDesign?.name,
            ...this.form.getRawValue()
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
                    setTimeout(() => {
                        document.querySelector('.order-confirmation-screen')?.scrollIntoView({ behavior: 'smooth' });
                    }, 200);
                    this.toast.show(this.successMessage, { type: 'success' });
                },
                error: () => this.toast.show('Something went wrong. Please try again.', { type: 'error' })
            });
    }

    newOrder(): void {
        this.form.reset();
        this.imagePreviews = {};
        this.selectedDesign = null;
        this.selectedVariant = null;
        this.submitted = false;
        this.showReview = false;
        this.successMessage = '';
        this.orderId = '';
        this.emailSent = false;
        this.formOpen = true;
        window.scrollTo({ top: 0 });
    }

    get showReview(): boolean {
        return this._showReview;
    }

    set showReview(val: boolean) {
        this._showReview = val;
    }

    isInvalid(name: string): boolean {
        const ctrl = this.form.get(name);
        return !!ctrl && ctrl.invalid && (ctrl.touched || this.submitted);
    }
}
