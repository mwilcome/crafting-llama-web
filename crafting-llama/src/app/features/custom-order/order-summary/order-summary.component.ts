import { Component, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MOCK_DESIGNS } from '@core/catalog/designs';
import { Design, FieldDef, OrderDraftEntry } from '@core/catalog/design.types';
import { getFields, getFieldLabel } from '@core/utils/field-coercion';
import { getImage, getDesignName, getVariantName } from '@core/utils/entry-utils';
import {OrderDraftService} from "@services/order-draft.service";

@Component({
    selector: 'app-order-summary',
    standalone: true,
    templateUrl: './order-summary.component.html',
    styleUrls: ['./order-summary.component.scss'],
    imports: [CommonModule],
})
export class OrderSummaryComponent {
    readonly designs = signal<Design[]>(MOCK_DESIGNS);
    readonly entries = computed(() => this.draft.entries());

    constructor(private draft: OrderDraftService) {}

    getImage(entry: OrderDraftEntry): string {
        return getImage(entry, this.designs());
    }

    getDesignName(entry: OrderDraftEntry): string {
        return getDesignName(entry, this.designs());
    }

    getVariantName(entry: OrderDraftEntry): string {
        return getVariantName(entry, this.designs());
    }

    getVisibleFields(entry: OrderDraftEntry): FieldDef[] {
        return getFields(entry, this.designs());
    }

    getLabel(entry: OrderDraftEntry, key: string): string {
        return getFieldLabel(entry, key, this.designs());
    }

    totalCost(): number {
        return this.entries().reduce((sum, entry) => {
            const design = this.designs().find(d => d.id === entry.designId);
            const variant = design?.variants?.find(v => v.id === entry.variantId);
            const price = variant?.price ?? design?.priceFrom ?? 0;
            return sum + price * (entry.quantity || 1);
        }, 0);
    }

    submitOrder(): void {
        alert('Order submitted!');
    }
}
