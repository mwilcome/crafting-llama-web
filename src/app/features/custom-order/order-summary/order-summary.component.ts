import { Component, computed, inject, signal } from '@angular/core';
import {Router, RouterLink} from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { OrderDraftService } from '@services/order-draft.service';
import { OrderFormService } from '@services/order-form.service';
import { DesignService } from '@core/catalog/design.service';
import { DesignTransformerService } from '@services/design-transformer.service';
import { getDesignName, getImage, getVariantName } from '@core/utils/entry-utils';
import { SUPABASE_CLIENT } from '@core/supabase/supabase.client';
import { ToastService } from '@shared/services/toast/toast.service';
import { ColorService } from '@core/catalog/color.service';
import { OrderLimitService } from '@core/catalog/order-limit.service';
import {LoaderService} from "@shared/services/loader/loader.service";


@Component({
    selector: 'app-order-summary',
    standalone: true,
    templateUrl: './order-summary.component.html',
    styleUrls: ['./order-summary.component.scss'],
    imports: [CommonModule, FormsModule, RouterLink],
})
export class OrderSummaryComponent {
    private readonly supabase = inject(SUPABASE_CLIENT);
    private readonly draft = inject(OrderDraftService);
    private readonly formSvc = inject(OrderFormService);
    private readonly designsSig = inject(DesignService).designs;
    private readonly router = inject(Router);
    private readonly transformer = inject(DesignTransformerService);
    private readonly toast = inject(ToastService);
    private readonly colorService = inject(ColorService);
    protected readonly orderLimit = inject(OrderLimitService);
    private readonly loader = inject(LoaderService);

    email = signal('');
    showEmailPrompt = signal(false);
    emailError = signal('');

    readonly entries = computed(() => this.draft.entries());
    readonly designs = computed(() => this.designsSig());

    readonly entryView = computed(() =>
        this.entries().map(entry => {
            const design = this.designs().find(d => d.id === entry.designId);
            const variant = design?.variants?.find(v => v.id === entry.variantId);
            const price = variant?.price ?? design?.priceFrom ?? 0;
            const fields = this.formSvc.getFields(entry, this.designs()).filter(f => !f.disabled);
            return { entry, design, variant, price, fields };
        })
    );

    readonly orderTotal = computed(() =>
        this.entryView().reduce((sum, i) => sum + i.price * i.entry.quantity, 0)
    );

    getDesignName = getDesignName;
    getVariantName = getVariantName;
    getImage = getImage;

    getColorName(hex: string): string | null {
        return typeof hex === 'string' ? this.colorService.getColorName(hex) : null;
    }

    getValue(entry: any, key: string) {
        const val = entry.values[key];
        if (Array.isArray(val)) return val.join(', ');
        return typeof val === 'string' ? val : val?.name ?? null;
    }

    hasValue(entry: any, key: string): boolean {
        const val = entry.values?.[key];
        if (val === null || val === undefined) return false;
        if (Array.isArray(val)) return val.length > 0;
        if (val instanceof File) return true;
        return typeof val === 'string' ? val.trim() !== '' : true;
    }

    isHexColor(val: string | File | null): boolean {
        return typeof val === 'string' && /^#[0-9A-F]{6}$/i.test(val);
    }

    formatValue(val: any): string {
        if (Array.isArray(val)) return val.join(', ');
        if (val instanceof File) return val.name;
        return val;
    }

    async submit(): Promise<void> {
        await this.orderLimit.refresh();

        if (this.orderLimit.isAtLimit()) {
            this.toast.show('We’re currently at full order capacity. Please check back soon.', {
                type: 'error',
            });
            return;
        }

        if (!this.validateEmail(this.email())) {
            this.showEmailPrompt.set(true);
        } else {
            void this.finalSubmit();
        }
    }

    confirmEmail(): void {
        if (!this.validateEmail(this.email())) {
            this.emailError.set('Please enter a valid email address.');
        } else {
            this.emailError.set('');
            this.showEmailPrompt.set(false);
            void this.finalSubmit();
        }
    }

    cancelEmail(): void {
        this.showEmailPrompt.set(false);
        this.emailError.set('');
    }

    private validateEmail(email: string): boolean {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    private async finalSubmit(): Promise<void> {
        this.loader.show();
        try {
            const { order: orderData, entries: entryData } = this.transformer.toSupabaseOrder(
                this.email(),
                this.entries(),
                this.orderTotal()
            );

            const { data: insertedOrder, error: oErr } = await this.supabase
                .from('orders')
                .insert(orderData)
                .select('*')
                .single();
            if (oErr || !insertedOrder) throw oErr || new Error('Order insertion failed');

            const entriesWithOrderId = entryData.map(e => ({
                ...e,
                order_id: insertedOrder.id
            }));
            const { error: eErr } = await this.supabase.from('order_entries').insert(entriesWithOrderId);
            if (eErr) throw eErr;

            const payload = { order_id: insertedOrder.id };

            const response = await fetch('/.netlify/functions/order-confirmation', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                throw new Error(`Email confirmation failed: ${response.statusText}`);
            }

            this.draft.resetAll();
            await this.router.navigate(['/custom', 'done']);
        } catch (err: any) {
            const raw = err?.message ?? err?.details ?? err;
            const userFriendly = typeof raw === 'string' && raw.includes('Order limit')
                ? 'Order limit reached. Please try again later.'
                : 'Order submit failed. Please try again.';

            this.toast.show(userFriendly, { type: 'error' });
        } finally {
            this.loader.hide();
        }
    }
}