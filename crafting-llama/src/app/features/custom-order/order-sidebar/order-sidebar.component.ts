import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {OrderFlowService} from "@services/order-flow.service";

@Component({
    selector: 'app-order-sidebar',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './order-sidebar.component.html',
    styleUrls: ['./order-sidebar.component.scss'],
})
export class OrderSidebarComponent {
    private readonly flow = inject(OrderFlowService);
    readonly entry = this.flow.inProgressEntry;
    readonly isOpen = signal(true);

    toggle() {
        this.isOpen.update(val => !val);
    }

    formatValue(val: string | File | undefined): string {
        if (typeof val === 'string') return val || '(none)';
        if (val instanceof File) return val.name;
        return '(none)';
    }
}
