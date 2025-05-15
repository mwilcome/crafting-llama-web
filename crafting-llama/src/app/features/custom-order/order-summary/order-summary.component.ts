import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OrderDraftService } from '@services/order-draft.service';
import { OrderFlowService } from '@services/order-flow.service';
import { MOCK_DESIGNS } from '@core/catalog/designs';

@Component({
    standalone: true,
    selector: 'app-order-summary',
    templateUrl: './order-summary.component.html',
    styleUrls: ['./order-summary.component.scss'],
    imports: [CommonModule]
})
export class OrderSummaryComponent {
    private drafts = inject(OrderDraftService);
    private flow = inject(OrderFlowService);

    readonly all = this.drafts.all;
    readonly totalItems = computed(() => this.all().length);
    readonly designs = MOCK_DESIGNS;

    getDesignName(id: string): string {
        return this.designs.find(d => d.id === id)?.name ?? id;
    }

    submit() {
        // Placeholder for real submission logic (e.g. REST API)
        console.log('Order submitted:', this.all());

        this.drafts.reset();
        this.flow.goTo('select');
    }

    protected readonly Object = Object;
}
