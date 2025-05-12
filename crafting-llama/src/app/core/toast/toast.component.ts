import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService } from './toast.service';

@Component({
    selector: 'app-toast',
    standalone: true,
    imports: [CommonModule],
    template: `
        <div class="toast" *ngIf="toast.msg$ | async as msg">
            {{ msg }}
        </div>
    `,
    styleUrls: ['./toast.component.css']
})
export class ToastComponent {
    constructor(public toast: ToastService) {}
}
