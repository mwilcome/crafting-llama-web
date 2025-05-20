import { Component, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { OrderDraftService } from '@services/order-draft.service';
import { MOCK_DESIGNS } from '@core/catalog/designs';
import { OrderDraftEntry, Design, FieldDef } from '@core/catalog/design.types';
import { getFields, getFieldLabel } from '@core/utils/field-coercion';
import { getDesignName, getImage, getVariantName } from '@core/utils/entry-utils';

@Component({
    selector: 'app-review-list',
    standalone: true,
    templateUrl: './review-list.component.html',
    styleUrls: ['./review-list.component.scss'],
    imports: [CommonModule],
})
export class ReviewListComponent {
    readonly designs = signal<Design[]>(MOCK_DESIGNS);
    readonly entries = computed(() => this.draft.entries());

    constructor(
        private draft: OrderDraftService,
        private router: Router,
        private route: ActivatedRoute
    ) {}

    getImage(entry: OrderDraftEntry): string {
        return getImage(entry, this.designs());
    }

    getDesignName(entry: OrderDraftEntry): string {
        return getDesignName(entry, this.designs());
    }

    getVariantName(entry: OrderDraftEntry): string {
        return getVariantName(entry, this.designs());
    }

    getVisibleFields(entry: OrderDraftEntry): FieldDef[] {
        return getFields(entry, this.designs());
    }

    getLabel(entry: OrderDraftEntry, key: string): string {
        return getFieldLabel(entry, key, this.designs());
    }

    edit(id: string): void {
        this.draft.select(id);
        this.router.navigate(['../form'], { relativeTo: this.route });
    }

    remove(id: string): void {
        this.draft.removeEntry(id);
    }

    goToSummary(): void {
        this.router.navigate(['../summary'], { relativeTo: this.route });
    }
}
