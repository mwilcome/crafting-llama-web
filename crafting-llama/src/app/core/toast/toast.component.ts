import { Component } from '@angular/core';
import { ToastService } from './toast.service';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-toast',
    standalone: true,
    imports: [CommonModule],
    template: `
        <div class="toast-container" aria-live="polite">
            <div *ngFor="let t of toast.getToasts()" class="toast" [ngClass]="t.type">
                {{ t.message }}
            </div>
        </div>
    `,
    styleUrls: ['./toast.component.scss']
})
export class ToastComponent {
    constructor(public toast: ToastService) {}
}
