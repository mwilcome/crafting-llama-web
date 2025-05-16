import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OrderDraftService } from '@services/order-draft.service';
import { OrderFlowService } from '@services/order-flow.service';
import { MOCK_DESIGNS } from '@core/catalog/designs';
import { Variant } from '@core/catalog/design.types';

@Component({
    selector: 'app-variant-selector',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './variant-selector.component.html',
    styleUrls: ['./variant-selector.component.scss'],
})
export class VariantSelectorComponent {
    readonly variants: Variant[] = [];

    constructor(
        private readonly drafts: OrderDraftService,
        private readonly flow: OrderFlowService
    ) {
        const entry = this.drafts.active();
        const design = MOCK_DESIGNS.find((d) => d.id === entry?.designId);
        this.variants = design?.variants ?? [];
    }

    selectVariant(variantId: string): void {
        this.drafts.selectVariant(variantId);
        this.flow.goTo('form');
    }
}
