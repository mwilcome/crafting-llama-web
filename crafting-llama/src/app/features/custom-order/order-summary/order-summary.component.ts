import {Component, computed, inject, signal} from '@angular/core';
import { Router } from '@angular/router';

import { OrderDraftService } from '@services/order-draft.service';
import { OrderFormService } from '@services/order-form.service';
import { DesignService } from '@core/catalog/design.service';
import { getDesignName, getImage, getVariantName } from '@core/utils/entry-utils';
import {CommonModule} from "@angular/common";
import {FormsModule} from "@angular/forms";

import { DesignTransformerService } from '@services/design-transformer.service';
import { createClient } from '@supabase/supabase-js';
import {environment} from "@env/environment";

const supabase = createClient(environment.supabaseUrl, environment.supabaseKey);

@Component({
    selector: 'app-order-summary',
    standalone: true,
    templateUrl: './order-summary.component.html',
    styleUrls: ['./order-summary.component.scss'],
    imports: [CommonModule, FormsModule]
})
export class OrderSummaryComponent {
    private draft = inject(OrderDraftService);
    private form = inject(OrderFormService);
    private designs = inject(DesignService).designs;
    private router = inject(Router);
    private transformer = inject(DesignTransformerService);

    email = signal('');
    showEmailPrompt = signal(false);
    emailError = signal('');

    readonly entries = computed(() => this.draft.entries());
    readonly designsList = computed(() => this.designs());

    readonly entryView = computed(() =>
        this.entries().map(entry => {
            const design = this.designsList().find(d => d.id === entry.designId);
            const variant = design?.variants?.find(v => v.id === entry.variantId);
            const price = variant?.price ?? design?.priceFrom ?? 0;
            const fields = this.form.getFields(entry, this.designsList()).filter(f => !f.disabled);
            return { entry, design, variant, price, fields };
        })
    );

    readonly orderTotal = computed(() =>
        this.entryView().reduce((sum, item) => sum + (item.price * item.entry.quantity), 0)
    );

    getDesignName = getDesignName;
    getVariantName = getVariantName;
    getImage = getImage;

    submit(): void {
        if (!this.validateEmail(this.email())) {
            this.showEmailPrompt.set(true);
        } else {
            this.finalSubmit();
        }
    }

    confirmEmail(): void {
        if (!this.validateEmail(this.email())) {
            this.emailError.set('Please enter a valid email address.');
        } else {
            this.emailError.set('');
            this.showEmailPrompt.set(false);
            this.finalSubmit();
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
        const email = this.email();
        const entries = this.entries();
        const total = this.orderTotal();

        const { order, entries: entryRows } = this.transformer.toSupabaseOrder(email, entries, total);

        await supabase.from('orders').insert(order);
        await supabase.from('order_entries').insert(entryRows);

        this.draft.resetAll();
        this.router.navigate(['/custom', 'done']);
    }
}
