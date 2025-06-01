import { Component, signal, computed, inject } from '@angular/core';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';

import { DesignService } from '@core/catalog/design.service';
import { OrderDraftService } from '@services/order-draft.service';
import { Design } from '@core/catalog/design.types';

import { CommonModule } from '@angular/common';
import { DesignCardComponent } from '@shared/ui/card/design-card.component';

@Component({
    selector: 'app-design-selector',
    standalone: true,
    templateUrl: './design-selector.component.html',
    styleUrls: ['./design-selector.component.scss'],
    imports: [CommonModule, RouterModule, DesignCardComponent]
})
export class DesignSelectorComponent {
    private draft = inject(OrderDraftService);
    private router = inject(Router);
    private route = inject(ActivatedRoute);

    readonly designs = inject(DesignService).designs;
    readonly selected = signal<Design | null>(null);

    constructor() {
        const all = this.designs();
        if (all.length > 0) {
            this.selected.set(all[0]);
        }
    }

    choose(): void {
        const design = this.selected();
        if (!design) return;

        this.draft.addEntry({
            id: crypto.randomUUID(),
            designId: design.id,
            quantity: 1,
            values: {},
            createdAt: new Date()
        });

        const hasVariants = Array.isArray(design.variants) && design.variants.length > 0;
        const next = hasVariants ? 'variant' : 'form';
        this.router.navigate(['../' + next], { relativeTo: this.route });
    }

    isSelected = (design: Design): boolean => this.selected()?.id === design.id;
}
