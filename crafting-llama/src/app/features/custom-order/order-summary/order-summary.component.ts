import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OrderDraftService } from '@services/order-draft.service';
import { OrderFlowService } from '@services/order-flow.service';
import { MOCK_DESIGNS } from '@core/catalog/designs';
import { OrderDraftEntry } from '@models/order-entry.model';

@Component({
    selector: 'app-order-summary',
    standalone: true,
    templateUrl: './order-summary.component.html',
    styleUrls: ['./order-summary.component.scss'],
    imports: [CommonModule],
})
export class OrderSummaryComponent {
    readonly all;

    constructor(
        private readonly drafts: OrderDraftService,
        private readonly flow: OrderFlowService
    ) {
        this.all = this.drafts.all;
    }

    totalItems(): number {
        return this.all().length;
    }

    submit(): void {
        alert('TODO: Wire this up to backend or Firebase');
    }

    getDesignName(designId: string): string {
        return MOCK_DESIGNS.find((d) => d.id === designId)?.name ?? '';
    }

    getImageUrl(entry: OrderDraftEntry): string {
        const design = MOCK_DESIGNS.find((d) => d.id === entry.designId);
        const variant = design?.variants.find((v) => v.id === entry.variantId);
        return variant?.heroImage
            ? `/assets/images/placeholder/${variant.heroImage}`
            : '/assets/images/product-placeholder.jpg';
    }

    getKeys(obj: Record<string, any>): string[] {
        return Object.keys(obj);
    }
}
