import { Component, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OrderDraftService } from '@services/order-draft.service';
import { OrderFlowService } from '@services/order-flow.service';
import { MOCK_DESIGNS } from '@core/catalog/designs';
import { Variant } from '@core/catalog/design.types';

@Component({
    selector: 'app-variant-selector',
    standalone: true,
    templateUrl: './variant-selector.component.html',
    styleUrls: ['./variant-selector.component.scss'],
    imports: [CommonModule],
})
export class VariantSelectorComponent {
    readonly activeDraft;
    readonly variants;
    readonly imageUrl;

    constructor(
        private readonly drafts: OrderDraftService,
        private readonly flow: OrderFlowService
    ) {
        this.activeDraft = this.drafts.active;

        this.variants = computed(() => {
            const designId = this.activeDraft()?.designId;
            const design = MOCK_DESIGNS.find((d) => d.id === designId);
            return design?.variants ?? [];
        });

        this.imageUrl = computed(() => {
            const variantId = this.activeDraft()?.variantId;
            const variant = this.variants().find((v) => v.id === variantId);
            return variant?.heroImage
                ? `/assets/placeholder/${variant.heroImage}`
                : null;
        });
    }

    select(variant: Variant): void {
        const draft = this.activeDraft();
        if (!draft) return;

        draft.variantId = variant.id;
        this.drafts.hydrateFieldsFromVariant(draft);
        this.flow.goTo('form');
    }
}
