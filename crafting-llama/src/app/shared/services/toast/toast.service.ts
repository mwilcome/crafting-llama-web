import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ToastService {
    private msgSubject = new BehaviorSubject<string | null>(null);
    msg$: Observable<string | null> = this.msgSubject.asObservable();
    private toasts: { message: string; type?: string }[] = [];

    getToasts() {
        return this.toasts;
    }

    show(message: string, options?: { type?: string }) {
        this.toasts.push({ message, type: options?.type });
        setTimeout(() => this.toasts.shift(), 3000);
    }
}
