import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService } from '@shared/services/toast/toast.service';

@Component({
    selector: 'app-toast-stack',
    standalone: true,
    imports: [CommonModule],
    template: `
        <div class="toast-stack">
            @for (t of svc.toasts(); track t.id) {
                <div class="toast {{ t.type }}" role="alert">{{ t.message }}</div>
            }
        </div>
    `,
    styleUrls: ['./toast.component.scss'],
})
export class ToastComponent {
    svc = inject(ToastService);
}
