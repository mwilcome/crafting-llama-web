import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OrderFlowService } from '@services/order-flow.service';

@Component({
    selector: 'app-order-sidebar',
    standalone: true,
    imports: [CommonModule],
    template: `
        @if (entry = flow.inProgressEntry(); !!entry) {
            <aside class="order-sidebar">
                <h3>{{ entry.design.name }}</h3>
                <img [src]="entry.variant.heroImage" [alt]="entry.variant.name" />
                <ul>
                    @for (field of entry.fields; track field.key) {
                        <li (click)="focusField(field.key)">
                            <strong>{{ field.label }}:</strong> {{ entry.values[field.key] || '(none)' }}
                        </li>
                    }
                </ul>
                <p><strong>Quantity:</strong> {{ entry.quantity }}</p>
            </aside>
        }
    `,
    styleUrls: ['./order-sidebar.component.scss'],
})
export class OrderSidebarComponent {
    readonly flow = inject(OrderFlowService);

    focusField(fieldKey: string) {
        const el = document.querySelector(`[formControlName="${fieldKey}"]`) as HTMLElement;
        if (el) el.focus();
    }
}
