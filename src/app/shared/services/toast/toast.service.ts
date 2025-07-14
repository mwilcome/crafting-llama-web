import { Injectable, signal } from '@angular/core';

export type ToastKind = 'info' | 'success' | 'error';

export interface Toast {
    id: string;
    message: string;
    type: ToastKind;
    timeout: number;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
    private readonly _toasts = signal<Toast[]>([]);
    readonly toasts = this._toasts.asReadonly();

    show(message: string, opts: { type?: ToastKind; timeout?: number } = {}): void {
        const toast: Toast = {
            id: crypto.randomUUID(),
            message,
            type: opts.type ?? 'info',
            timeout: opts.timeout ?? 3_000,
        };
        this._toasts.update(a => [...a, toast]);
        setTimeout(() => this.dismiss(toast.id), toast.timeout);
    }

    dismiss(id: string): void {
        this._toasts.update(a => a.filter(t => t.id !== id));
    }
}
