import { Component, computed, inject } from '@angular/core';
import { Router } from '@angular/router';

import { OrderDraftService } from '@services/order-draft.service';
import { OrderFormService } from '@services/order-form.service';
import { DesignService } from '@core/catalog/design.service';
import { getDesignName, getImage, getVariantName } from '@core/utils/entry-utils';

@Component({
    selector: 'app-order-summary',
    standalone: true,
    templateUrl: './order-summary.component.html',
    styleUrls: ['./order-summary.component.scss'],
    imports: []
})
export class OrderSummaryComponent {
    private draft = inject(OrderDraftService);
    private form = inject(OrderFormService);
    private designs = inject(DesignService).designs;
    private router = inject(Router);

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
        console.log('🚀 Order submission triggered!');
        console.log(this.entries());

        // TODO: Call backend service when implemented
        this.draft.resetAll();
        this.router.navigate(['/custom', 'done']);
    }
}
