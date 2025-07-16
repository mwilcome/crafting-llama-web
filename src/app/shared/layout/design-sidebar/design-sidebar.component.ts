import { Component, Input, computed } from '@angular/core';
import { Design, Variant } from '@core/catalog/design.types';

@Component({
    selector: 'app-design-sidebar',
    standalone: true,
    templateUrl: './design-sidebar.component.html',
    styleUrls: ['./design-sidebar.component.scss'],
})
export class DesignSidebarComponent {
    @Input() design?: Design;
    @Input() variant?: Variant | null;

    readonly image = computed(() => this.variant?.heroImage ?? this.design?.heroImage ?? '');
    readonly title = computed(() => this.variant?.name ?? this.design?.name ?? '');
    readonly desc = computed(() => this.variant?.description ?? this.design?.description ?? '');
    readonly price = computed(() => this.variant?.price ?? this.design?.priceFrom ?? 0);
}