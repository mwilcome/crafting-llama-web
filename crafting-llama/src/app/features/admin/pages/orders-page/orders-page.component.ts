import {Component, effect, inject, signal} from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OrdersService } from '@core/catalog/order.service';
import { Order, OrderStatus } from '@core/catalog/order.types';
import {RouterLink} from "@angular/router";

@Component({
    selector: 'app-orders-page',
    standalone: true,
    imports: [CommonModule, RouterLink, DatePipe, FormsModule],
    templateUrl: './orders-page.component.html',
    styleUrls: ['./orders-page.component.scss'],
})
export class OrdersPageComponent {
    private ordersService = inject(OrdersService);

    readonly orders = signal<Order[]>([]);
    readonly page = signal(1);
    readonly loading = signal(false);
    readonly error = signal<string | null>(null);
    readonly searchId = signal('');

    constructor() {
        effect(() => {
            this.fetchOrders();
        });
    }

    async fetchOrders(): Promise<void> {
        this.loading.set(true);
        this.error.set(null);

        try {
            const result = await this.ordersService.fetchOrders(this.page(), 10, this.searchId() || undefined);
            this.orders.set(result);
        } catch (err: any) {
            this.error.set('Failed to load orders.');
            console.error(err);
        } finally {
            this.loading.set(false);
        }
    }

    async markComplete(orderId: string): Promise<void> {
        try {
            await this.ordersService.updateOrderStatus(orderId, OrderStatus.Completed);
            this.fetchOrders();
        } catch (err) {
            alert('Error marking order complete.');
        }
    }

    nextPage(): void {
        this.page.update(p => p + 1);
    }

    prevPage(): void {
        if (this.page() > 1) {
            this.page.update(p => p - 1);
        }
    }

    search(): void {
        this.page.set(1);
        this.fetchOrders();
    }
}