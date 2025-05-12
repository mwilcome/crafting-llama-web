import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { finalize } from 'rxjs';
import { Design, DesignService, VariantMeta, FieldDefinition } from '@core/design/design.service';
import { CustomOrderService, ThreadColor } from './custom-order.service';
import { LoaderService } from '@core/loader/loader.service';
import { ToastService } from '@core/toast/toast.service';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { DesignCardComponent } from './design-card.component';

@Component({
    selector: 'app-custom-order',
    standalone: true,
    templateUrl: './custom-order.component.html',
    styleUrls: ['./custom-order.component.scss'],
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        RouterLink,
        DesignCardComponent
    ]
})
export class CustomOrderComponent implements OnInit {
    formOpen = true;
    designs: Design[] = [];
    selectedDesign: Design | null = null;
    selectedVariant: VariantMeta | null = null;
    form!: FormGroup;
    imagePreviews: Record<string, string> = {};
    threadColors: ThreadColor[] = [];
    submitted = false;
    successMessage = '';
    orderId = '';
    emailSent = false;
    private _showReview = false;

    constructor(
        private fb: FormBuilder,
        private designService: DesignService,
        private orderService: CustomOrderService,
        private loader: LoaderService,
        private toast: ToastService
    ) {}

    ngOnInit(): void {
        this.orderService.getAvailableThreadColors().subscribe(c => this.threadColors = c);
        this.designService.getDesigns().subscribe(d => this.designs = d);
    }

    selectDesignType(d: Design): void {
        this.selectedDesign = d;

        this.selectedVariant = d.variants?.length
            ? null
            : { ...d, fields: d.fields ?? [], id: d.id + '-default' };

        if (this.selectedVariant) {
            this.buildForm(this.selectedVariant.fields ?? []);
        }
    }

    selectVariant(v: VariantMeta): void {
        this.selectedVariant = v;
        this.buildForm(v.fields ?? []);
    }

    buildForm(fields: FieldDefinition[]): void {
        const group: Record<string, FormControl> = {};

        fields.forEach(field => {
            let defaultValue: any = '';

            if (field.type === 'multiselect') {
                defaultValue = [];
            }

            if (field.type === 'dropdown' || field.type === 'radio' || field.type === 'color') {
                defaultValue = field.options?.[0] ?? '';
            }

            if (field.name === 'numberOfFlowers') {
                defaultValue = 1;
            }

            const control = field.required
                ? this.fb.control(defaultValue, Validators.required)
                : this.fb.control(defaultValue);

            group[field.name] = control;
        });

        this.form = this.fb.group(group);
        this.submitted = false;
        this.imagePreviews = {};
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

                    setTimeout(() => {
                        const el = document.querySelector('.order-confirmation-screen');
                        el?.scrollIntoView({ behavior: 'smooth' });
                    }, 100);
                },
                error: () => {
                    this.toast.show('Something went wrong. Please try again.', { type: 'error' });
                }
            });
    }

    newOrder(): void {
        this.form = this.fb.group({});
        this.selectedDesign = null;
        this.selectedVariant = null;
        this.submitted = false;
        this.showReview = false;
        this.successMessage = '';
        this.orderId = '';
        this.emailSent = false;
        this.imagePreviews = {};
        this.formOpen = true;
    }

    get showReview(): boolean {
        return this._showReview;
    }

    set showReview(val: boolean) {
        this._showReview = val;
    }
}
