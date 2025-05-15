import { Component, Input, Signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OrderDraftService } from '@services/order-draft.service';
import { OrderFlowService } from '@services/order-flow.service';
import {Variant} from "@core/catalog/design.types";

@Component({
    selector: 'app-variant-selector',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './variant-selector.component.html',
    styleUrls: ['./variant-selector.component.scss'],
})
export class VariantSelectorComponent {
    @Input({ required: true }) variants!: Variant[];
    readonly drafts = inject(OrderDraftService);
    readonly flow = inject(OrderFlowService);
    readonly activeDraft = this.drafts.active;

    select(variant: Variant): void {
        const entry = this.drafts.active();
        if (!entry) return;

        entry.variantId = variant.id;
        this.drafts.hydrateFieldsFromVariant(entry);

        this.flow.goTo('form');
    }
}
