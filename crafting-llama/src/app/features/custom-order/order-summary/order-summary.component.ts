import { Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule }  from '@angular/forms';

import { OrderDraftService }      from '@services/order-draft.service';
import { OrderFormService }       from '@services/order-form.service';
import { DesignService }          from '@core/catalog/design.service';
import { DesignTransformerService } from '@services/design-transformer.service';
import { getDesignName, getImage, getVariantName } from '@core/utils/entry-utils';

import { SUPABASE_CLIENT } from '@core/supabase/supabase.client';

@Component({
    selector: 'app-order-summary',
    standalone: true,
    templateUrl: './order-summary.component.html',
    styleUrls: ['./order-summary.component.scss'],
    imports: [CommonModule, FormsModule]
})
export class OrderSummaryComponent {
    /* ---------- injections ---------- */
    private readonly supabase   = inject(SUPABASE_CLIENT);
    private readonly draft      = inject(OrderDraftService);
    private readonly form       = inject(OrderFormService);
    private readonly designsSig = inject(DesignService).designs;
    private readonly router     = inject(Router);
    private readonly transformer= inject(DesignTransformerService);

    /* ---------- reactive state ---------- */
    email          = signal('');
    showEmailPrompt= signal(false);
    emailError     = signal('');

    readonly entries = computed(() => this.draft.entries());
    readonly designs = computed(() => this.designsSig());

    readonly entryView = computed(() =>
        this.entries().map(entry => {
            const design  = this.designs().find(d => d.id === entry.designId);
            const variant = design?.variants?.find(v => v.id === entry.variantId);
            const price   = variant?.price ?? design?.priceFrom ?? 0;
            const fields  = this.form
                .getFields(entry, this.designs())
                .filter(f => !f.disabled);
            return { entry, design, variant, price, fields };
        })
    );

    readonly orderTotal = computed(() =>
        this.entryView().reduce((sum, i) => sum + i.price * i.entry.quantity, 0)
    );

    /* ---------- template helpers ---------- */
    getDesignName  = getDesignName;
    getVariantName = getVariantName;
    getImage       = getImage;

    /* ---------- workflow ---------- */
    submit(): void {
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
        try {
            const { order, entries } =
                this.transformer.toSupabaseOrder(this.email(), this.entries(), this.orderTotal());

            const { error: oErr } = await this.supabase.from('orders').insert(order);
            if (oErr) throw oErr;

            const { error: eErr } = await this.supabase.from('order_entries').insert(entries);
            if (eErr) throw eErr;

            this.draft.resetAll();
            await this.router.navigate(['/custom', 'done']);
        } catch (err) {
            // TODO: toast service
            console.error('Order submit failed', err);
        }
    }
}
