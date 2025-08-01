import {Component, Input, inject, signal} from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

import { Design } from '@core/catalog/design.types';
import { OrderDraftService } from '@services/order-draft.service';
import { storageUrl } from '@core/storage/storage-url';

@Component({
    selector: 'app-design-card',
    standalone: true,
    imports: [CommonModule, RouterModule],
    templateUrl: './design-card.component.html',
    styleUrls: ['./design-card.component.scss'],
})
export class DesignCardComponent {
    @Input({ required: true }) design!: Design;

    private draft = inject(OrderDraftService);
    private router = inject(Router);

    handleClick(): void {
        this.draft.setPendingDesign(this.design);

        const hasVariants = Array.isArray(this.design.variants) && this.design.variants.length > 0;
        const nextStep = hasVariants ? 'variant' : 'form';

        this.router.navigate(['/custom', nextStep]);
    }

    protected readonly storageUrl = storageUrl;
}
