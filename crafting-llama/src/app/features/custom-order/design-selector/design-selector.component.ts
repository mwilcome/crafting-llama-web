import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {ActivatedRoute, Router, RouterModule} from '@angular/router';
import { OrderDraftService } from '@services/order-draft.service';
import { MOCK_DESIGNS } from '@core/catalog/designs';
import { Design } from '@core/catalog/design.types';

@Component({
    selector: 'app-design-selector',
    standalone: true,
    templateUrl: './design-selector.component.html',
    styleUrls: ['./design-selector.component.scss'],
    imports: [CommonModule, RouterModule],
})
export class DesignSelectorComponent {
    readonly designs = signal<Design[]>(MOCK_DESIGNS);

    constructor(
        private draft: OrderDraftService,
        private router: Router,
        private route: ActivatedRoute
    ) {
    }

    select(design: Design): void {
        this.draft.addEntry({
            id: crypto.randomUUID(),
            designId: design.id,
            quantity: 1,
            values: {},
            createdAt: new Date()
        });

        const hasVariants = Array.isArray(design.variants) && design.variants.length > 0;
        const nextStep = hasVariants ? 'variant' : 'form';

        this.router.navigate(['../' + nextStep], { relativeTo: this.route });
    }

}
