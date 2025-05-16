import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OrderDraftService } from '@services/order-draft.service';
import { OrderFlowService } from '@services/order-flow.service';
import { MOCK_DESIGNS } from '@core/catalog/designs';

@Component({
    selector: 'app-order-summary',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './order-summary.component.html',
    styleUrls: ['./order-summary.component.scss'],
})
export class OrderSummaryComponent {
    readonly drafts;

    constructor(
        private readonly flow: OrderFlowService,
        private readonly draftService: OrderDraftService
    ) {
        this.drafts = this.draftService.all;
    }

    totalItems(): number {
        return this.drafts().reduce((sum, entry) => sum + (entry.quantity || 1), 0);
    }

    getDesignName(designId: string): string {
        return MOCK_DESIGNS.find((d) => d.id === designId)?.name ?? 'Unknown';
    }

    getImageUrl(entry: any): string | undefined {
        return this.draftService.getImageUrl(entry);
    }

    getKeys(obj: Record<string, any>): string[] {
        return Object.keys(obj);
    }

    submit(): void {
        // You’ll replace this stub when wiring to your backend
        console.log('Submitting order:', this.drafts());
        alert('Order submitted!');
        this.flow.goTo('select');
    }
}
