import { Component, OnInit } from '@angular/core';
import { finalize } from 'rxjs';
import { DesignService, VariantMeta, Design, FieldDefinition } from '@core/design/design.service';
import { CustomOrderService, ThreadColor } from './custom-order.service';
import { LoaderService } from '@core/loader/loader.service';
import { ToastService } from '@core/toast/toast.service';
import {DesignCardComponent} from "@features/custom-order/design-card.component";
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {RouterLink} from "@angular/router";

@Component({
    selector: 'app-custom-order',
    templateUrl: './custom-order.component.html',
    styleUrls: ['./custom-order.component.css'],
    standalone: true,
    imports: [
        DesignCardComponent,
        FormsModule,
        CommonModule,
        RouterLink
    ]
})
export class CustomOrderComponent implements OnInit {
    formOpen = true;
    designs: Design[] = [];
    selectedDesign: Design | null = null;
    selectedVariant: VariantMeta | null = null;

    form: Record<string, any> = {};
    imagePreviews: Record<string, string> = {};
    threadColors: ThreadColor[] = [];

    submitted = false;
    successMessage = '';
    orderId = '';
    emailSent = false;
    private _showReview = false;

    constructor(
        private designService: DesignService,
        private orderService: CustomOrderService,
        private loader: LoaderService,
        private toast: ToastService
    ) {}

    ngOnInit(): void {
        this.form = {};
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
            group[f.name] = base;
        });
        this.form = group;
        this.submitted = false;
        this.imagePreviews = {};
    }

    onMultiSelectChange(e: Event, name: string): void {
        const input = e.target as HTMLInputElement;
        const current = this.form[name] ?? [];
        this.form[name] = input.checked
            ? [...current, input.value]
            : current.filter((v: string) => v !== input.value);
    }

    onFileChange(e: Event, name: string): void {
        const input = e.target as HTMLInputElement;
        if (input.files?.length) {
            const file = input.files[0];
            this.form[name] = file;
            this.imagePreviews[name] = URL.createObjectURL(file);
        }
    }

    next(): void {
        this.submitted = true;
        const missingRequired = this.selectedVariant?.fields?.some(
            f => f.required && !this.form[f.name]
        );
        if (missingRequired) {
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
            ...this.form
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
                },
                error: () => this.toast.show('Something went wrong. Please try again.', { type: 'error' })
            });
    }

    newOrder(): void {
        this.form = {};
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
}
