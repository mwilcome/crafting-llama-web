import {Component, inject} from '@angular/core';

import {ActivatedRoute, Router, RouterModule} from '@angular/router';
import { OrderDraftService } from '@services/order-draft.service';
import { Design } from '@core/catalog/design.types';
import {DesignService} from "@core/catalog/design.service";

@Component({
    selector: 'app-design-selector',
    standalone: true,
    templateUrl: './design-selector.component.html',
    styleUrls: ['./design-selector.component.scss'],
    imports: [RouterModule],
})
export class DesignSelectorComponent {
    readonly designs = inject(DesignService).designs;

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
