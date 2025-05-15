import { Component, inject, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Design } from '@core/catalog/design.types';
import { DesignCardComponent } from '@shared/ui/card/design-card.component';
import { OrderDraftService } from '@services/order-draft.service';
import { OrderFlowService } from '@services/order-flow.service';
import {DESIGNS} from "@core/catalog/designs";

@Component({
    standalone: true,
    selector: 'app-design-selector',
    templateUrl: './design-selector.component.html',
    styleUrls: ['./design-selector.component.scss'],
    imports: [CommonModule],
})
export class DesignSelectorComponent {
    // TODO: This is temporary stubbing until the services are wired.
    designs = DESIGNS;

    private drafts = inject(OrderDraftService);
    private flow = inject(OrderFlowService);

    onSelect(design: Design) {
        this.drafts.add({
            id: crypto.randomUUID(),
            designId: design.id,
            variantId: '',
            quantity: 1,
            fields: [],
            formData: {},
            createdAt: new Date(),
        });

        this.flow.goTo('variant');
    }
}
