import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { OrderDraftService } from '@services/order-draft.service';

@Component({
    standalone: true,
    selector: 'app-header',
    templateUrl: './header.component.html',
    styleUrls: ['./header.component.scss'],
    imports: [CommonModule, RouterLink]
})
export class HeaderComponent {
    private drafts = inject(OrderDraftService);
    readonly draftCount = computed(() => this.drafts.all().length);
}
