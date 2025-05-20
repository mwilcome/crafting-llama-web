import {Component, computed, inject, signal} from '@angular/core';
import { CommonModule } from '@angular/common';
import { OrderDraftService } from '@services/order-draft.service';
import { Design, OrderDraftEntry } from '@core/catalog/design.types';
import { getDesignName, getVariantName, getImage } from '@core/utils/entry-utils';
import {DesignService} from "@core/catalog/design.service";

@Component({
    selector: 'app-order-sidebar',
    standalone: true,
    templateUrl: './order-sidebar.component.html',
    styleUrls: ['./order-sidebar.component.scss'],
    imports: [CommonModule],
})
export class OrderSidebarComponent {
    readonly designs = inject(DesignService).designs;
    readonly entries = computed(() => this.draft.entries());

    constructor(private draft: OrderDraftService) {}

    getImage(entry: OrderDraftEntry): string {
        return getImage(entry, this.designs());
    }

    getDesign(entry: OrderDraftEntry): string {
        return getDesignName(entry, this.designs());
    }

    getVariant(entry: OrderDraftEntry): string {
        return getVariantName(entry, this.designs());
    }
}
