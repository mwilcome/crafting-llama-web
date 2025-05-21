import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OrderDraftService } from '@services/order-draft.service';
import { DesignService } from '@core/catalog/design.service';
import { OrderFormService } from '@services/order-form.service';
import { getDesignName, getImage, getVariantName } from '@core/utils/entry-utils';
import { Design } from '@core/catalog/design.types';

@Component({
    selector: 'app-order-sidebar',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './order-sidebar.component.html',
    styleUrls: ['./order-sidebar.component.scss'],
})
export class OrderSidebarComponent {
    private draft = inject(OrderDraftService);
    private form = inject(OrderFormService);
    readonly designs = inject(DesignService).designs;

    readonly entries = computed(() => this.draft.entries());

    // Expand/collapse state
    readonly expandedEntryId = signal<string | null>(null);
    toggleExpanded(id: string): void {
        this.expandedEntryId.update(current => (current === id ? null : id));
    }
    isExpanded(id: string): boolean {
        return this.expandedEntryId() === id;
    }

    // Display helpers from entry-utils
    getDesignName = getDesignName;
    getVariantName = getVariantName;
    getImage = getImage;

    // Delegates to OrderFormService for field metadata
    getFieldLabel(entry: any, key: string, designs: Design[]): string {
        return this.form.getFieldLabel(entry, key, designs);
    }

    getDisplayFields(entry: any): string[] {
        return Object.keys(entry.values).filter(
            key => !['quantity'].includes(key)
        );
    }

    // Inline asset support
    isImageField(value: string | File): boolean {
        if (!value) return false;
        const name = typeof value === 'string' ? value : value.name;
        return /\.(jpe?g|png|gif|webp)$/i.test(name.trim());
    }

    getImagePreview(value: string | File): string {
        if (typeof value === 'string') {
            return 'assets/uploads/' + value;
        }
        return URL.createObjectURL(value);
    }

    isHexColor(value: unknown): boolean {
        return typeof value === 'string' && /^#([A-Fa-f0-9]{3}){1,2}$/.test(value.trim());
    }
}
