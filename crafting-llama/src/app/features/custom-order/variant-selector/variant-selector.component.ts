import {Component, computed, inject} from '@angular/core';
import { CommonModule } from '@angular/common';
import { OrderFlowService } from '@services/order-flow.service';
import { Variant } from '@core/catalog/design.types';

@Component({
    selector: 'app-variant-selector',
    standalone: true,
    templateUrl: './variant-selector.component.html',
    styleUrls: ['./variant-selector.component.scss'],
    imports: [CommonModule],
})
export class VariantSelectorComponent {
    private flow = inject(OrderFlowService);

    readonly variants = computed(() => this.flow.design()?.variants ?? []);

    select(variant: Variant) {
        const design = this.flow.design();
        if (design) {
            this.flow.setVariant(variant);
            this.flow.startNewEntry(design, variant);
        }
    }
}
