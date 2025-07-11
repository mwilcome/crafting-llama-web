import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class PriceDisclaimerService {
    readonly visible = signal(false);

    constructor() {
        const shown = sessionStorage.getItem('price_disclaimer_shown');
        if (!shown) {
            this.visible.set(true);
        }
    }

    dismiss(): void {
        sessionStorage.setItem('price_disclaimer_shown', 'true');
        this.visible.set(false);
    }
}
