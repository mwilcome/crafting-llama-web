import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OrderDraftService } from '@services/order-draft.service';
import { OrderFlowService } from '@services/order-flow.service';
import { OrderDraftEntry } from '@models/order-entry.model';
import { MOCK_DESIGNS } from '@core/catalog/designs';

@Component({
    selector: 'app-order-summary',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './order-summary.component.html',
    styleUrls: ['./order-summary.component.scss'],
})
export class OrderSummaryComponent {
    readonly drafts: OrderDraftEntry[];

    constructor(
        private readonly draftService: OrderDraftService,
        private readonly flow: OrderFlowService
    ) {
        this.drafts = this.draftService.all();
    }

    getImageUrl(entry: OrderDraftEntry): string | null {
        const design = MOCK_DESIGNS.find(d => d.id === entry.designId);
        const variant = design?.variants?.find(v => v.id === entry.variantId);
        return variant?.heroImage ?? null;
    }

    getDesignName(entry: OrderDraftEntry): string {
        return MOCK_DESIGNS.find(d => d.id === entry.designId)?.name ?? 'Unknown Design';
    }

    getKeys(obj: Record<string, any>): string[] {
        return Object.keys(obj ?? {});
    }

    totalItems(): number {
        return this.drafts.reduce((sum, entry) => sum + (entry.quantity ?? 1), 0);
    }

    submit(): void {
        // Placeholder for eventual backend submit call
        this.flow.reset();
    }
}
