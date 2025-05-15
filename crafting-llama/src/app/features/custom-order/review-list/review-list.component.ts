import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OrderDraftService } from '@services/order-draft.service';
import { OrderFlowService } from '@services/order-flow.service';
import { Design } from '@core/catalog/design.types';
import { MOCK_DESIGNS } from '@core/catalog/designs';
import {of} from "rxjs";

@Component({
    standalone: true,
    selector: 'app-review-list',
    templateUrl: './review-list.component.html',
    styleUrls: ['./review-list.component.scss'],
    imports: [CommonModule],
})
export class ReviewListComponent {
    private drafts = inject(OrderDraftService);
    private flow = inject(OrderFlowService);

    readonly allDrafts = this.drafts.all;

    // For name lookup
    readonly designs = MOCK_DESIGNS;

    getDesignName(designId: string): string {
        return this.designs.find(d => d.id === designId)?.name ?? designId;
    }

    edit(index: number) {
        this.drafts.edit(index);
        this.flow.goTo('form');
    }

    remove(index: number) {
        const updated = this.allDrafts().filter((_, i) => i !== index);
        this.drafts.reset(updated);
    }

    protected readonly Object = Object;
    protected readonly of = of;
}
