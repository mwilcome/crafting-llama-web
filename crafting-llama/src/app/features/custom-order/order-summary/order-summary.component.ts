import {Component, computed, inject} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FieldDef, OrderDraftEntry } from '@core/catalog/design.types';
import { getImage, getDesignName, getVariantName } from '@core/utils/entry-utils';
import {OrderDraftService} from "@services/order-draft.service";
import {DesignService} from "@core/catalog/design.service";
import {OrderFormService} from "@services/order-form.service";

@Component({
    selector: 'app-order-summary',
    standalone: true,
    templateUrl: './order-summary.component.html',
    styleUrls: ['./order-summary.component.scss'],
    imports: [CommonModule],
})
export class OrderSummaryComponent {
    private formService = inject(OrderFormService);
    readonly designs = inject(DesignService).designs;
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
        return this.formService.getFields(entry, this.designs());
    }

    getLabel(entry: OrderDraftEntry, key: string): string {
        return this.formService.getFieldLabel(entry, key, this.designs());
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
