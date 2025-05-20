import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OrderDraftService } from '@services/order-draft.service';
import { DesignService } from '@core/catalog/design.service';
import { getDesignName, getImage, getVariantName } from '@core/utils/entry-utils';
import { OrderFormService } from '@services/order-form.service';
import {Design} from "@core/catalog/design.types";

@Component({
    selector: 'app-order-sidebar',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './order-sidebar.component.html',
    styleUrls: ['./order-sidebar.component.scss']
})
export class OrderSidebarComponent {
    private draft = inject(OrderDraftService);
    private form = inject(OrderFormService);
    readonly designs = inject(DesignService).designs;

    readonly entries = computed(() => this.draft.entries());

    getDesignName = getDesignName;
    getVariantName = getVariantName;
    getImage = getImage;

    getFieldLabel(entry: any, key: string, designs: Design[]): string {
        return this.form.getFieldLabel(entry, key, designs);
    }

    getDisplayFields(entry: any): string[] {
        return Object.keys(entry.values).filter(
            key => !['quantity'].includes(key)
        );
    }
}
