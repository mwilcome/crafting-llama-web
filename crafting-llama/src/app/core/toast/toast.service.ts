import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ToastService {
    private msgSubject = new BehaviorSubject<string | null>(null);
    msg$: Observable<string | null> = this.msgSubject.asObservable();

    show(message: string, options?: { type?: string }) {
        this.msgSubject.next(message);

        // Auto-clear after 4s
        setTimeout(() => {
            this.msgSubject.next(null);
        }, 4000);
    }
}
