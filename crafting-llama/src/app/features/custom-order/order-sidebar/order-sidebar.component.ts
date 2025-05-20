import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OrderDraftService } from '@services/order-draft.service';
import { MOCK_DESIGNS } from '@core/catalog/designs';
import { Design, OrderDraftEntry } from '@core/catalog/design.types';
import { getDesignName, getVariantName } from '@core/utils/entry-utils';

@Component({
    selector: 'app-order-sidebar',
    standalone: true,
    templateUrl: './order-sidebar.component.html',
    styleUrls: ['./order-sidebar.component.scss'],
    imports: [CommonModule],
})
export class OrderSidebarComponent {
    readonly designs = signal<Design[]>(MOCK_DESIGNS);
    readonly entries = computed(() => this.draft.entries());

    constructor(private draft: OrderDraftService) {}

    getDesign(entry: OrderDraftEntry): string {
        return getDesignName(entry, this.designs());
    }

    getVariant(entry: OrderDraftEntry): string {
        return getVariantName(entry, this.designs());
    }
}
