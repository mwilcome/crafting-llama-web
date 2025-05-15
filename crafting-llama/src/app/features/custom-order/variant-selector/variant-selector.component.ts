import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OrderDraftService } from '@services/order-draft.service';
import { OrderFlowService } from '@services/order-flow.service';

@Component({
    standalone: true,
    selector: 'app-variant-selector',
    templateUrl: './variant-selector.component.html',
    styleUrls: ['./variant-selector.component.scss'],
    imports: [CommonModule]
})
export class VariantSelectorComponent {
    private drafts = inject(OrderDraftService);
    private flow = inject(OrderFlowService);

    readonly activeDraft = this.drafts.active;

    continue() {
        this.flow.goTo('form');
    }
}
