import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OrderDraftService } from '@services/order-draft.service';
import { OrderFlowService } from '@services/order-flow.service';
import { MOCK_DESIGNS } from '@core/catalog/designs';
import { Design } from '@core/catalog/design.types';

@Component({
    selector: 'app-design-selector',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './design-selector.component.html',
    styleUrls: ['./design-selector.component.scss'],
})
export class DesignSelectorComponent {
    readonly designs: Design[];

    constructor(
        private readonly drafts: OrderDraftService,
        private readonly flow: OrderFlowService
    ) {
        this.designs = MOCK_DESIGNS;
    }

    select(design: Design): void {
        this.drafts.start({ designId: design.id });
        this.flow.goTo('variant');
    }
}
