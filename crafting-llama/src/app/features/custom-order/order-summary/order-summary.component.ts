import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OrderDraftService } from '@services/order-draft.service';
import { getFieldLabel, getImageUrl } from '@core/utils/entry-utils';
import { computed } from '@angular/core';

@Component({
    selector: 'app-order-summary',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './order-summary.component.html',
    styleUrls: ['./order-summary.component.scss'],
})
export class OrderSummaryComponent {
    private drafts = inject(OrderDraftService);
    readonly entries = this.drafts.allDrafts;

    totalCost = computed(() =>
        this.entries().reduce((sum, entry) => sum + entry.quantity * 10, 0)
    );

    submitOrder() {
        alert('Submitting order (stubbed)');
    }

    getImageUrl = getImageUrl;

    getFieldLabel(entry: any, key: string): string {
        return getFieldLabel(entry.designId, key);
    }

    protected readonly Object = Object;
}
