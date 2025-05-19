import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MOCK_DESIGNS } from '@core/catalog/designs';
import { OrderFlowService } from '@services/order-flow.service';

@Component({
    selector: 'app-design-selector',
    standalone: true,
    templateUrl: './design-selector.component.html',
    styleUrls: ['./design-selector.component.scss'],
    imports: [CommonModule],
})
export class DesignSelectorComponent {
    private flow = inject(OrderFlowService);
    readonly designs = MOCK_DESIGNS;

    select(design: any) {
        this.flow.setDesign(design);
        this.flow.goTo('variant');
    }
}
