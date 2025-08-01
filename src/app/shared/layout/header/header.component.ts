import { Component, inject, signal, computed } from '@angular/core';

import { RouterLink } from '@angular/router';
import { OrderDraftService } from '@services/order-draft.service';

@Component({
    standalone: true,
    selector: 'app-header',
    templateUrl: './header.component.html',
    styleUrls: ['./header.component.scss'],
    imports: [RouterLink]
})
export class HeaderComponent {
    private drafts = inject(OrderDraftService);
    readonly draftCount = computed(() => this.drafts.entries().length);
    readonly menuOpen = signal(false);

    toggleMenu() {
        this.menuOpen.update(open => !open);
    }
}