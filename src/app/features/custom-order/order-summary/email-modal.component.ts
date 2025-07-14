import { Component, EventEmitter, Input, Output } from '@angular/core';
import {FormsModule} from "@angular/forms";

@Component({
    selector: 'app-email-modal',
    templateUrl: './email-modal.component.html',
    imports: [
        FormsModule
    ],
    styleUrls: ['./email-modal.component.scss']
})
export class EmailModalComponent {
    @Input() isOpen = false;
    @Output() close = new EventEmitter<void>();
    @Output() submit = new EventEmitter<string>();

    email = '';
    error = '';

    onSubmit() {
        if (this.validateEmail(this.email)) {
            this.submit.emit(this.email);
            this.closeModal();
        } else {
            this.error = 'Invalid email address';
        }
    }

    closeModal() {
        this.close.emit();
        this.email = '';
        this.error = '';
    }

    private validateEmail(email: string): boolean {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }
}