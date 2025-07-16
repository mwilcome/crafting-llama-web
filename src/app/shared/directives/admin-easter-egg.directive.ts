import { Directive, HostListener, inject } from '@angular/core';
import { Router } from '@angular/router';
import { signal } from '@angular/core';

@Directive({
    selector: '[adminEasterEgg]',
    standalone: true
})
export class AdminEasterEggDirective {
    private tapCount = signal(0);
    private readonly router = inject(Router);

    // count both clicks (desktop) and touches (mobile)
    @HostListener('click')
    @HostListener('touchend')
    onTap(): void {
        const current = this.tapCount() + 1;
        this.tapCount.set(current);

        if (current === 3) {
            this.tapCount.set(0);              // reset for next secret visit
            this.router.navigateByUrl('/admin/dashboard');
            return;
        }

        // reset the counter if the 3 taps don't happen quickly enough
        setTimeout(() => {
            if (this.tapCount() === current) {
                this.tapCount.set(0);
            }
        }, 1500); // 1.5 s window feels natural on both mouse & touch
    }
}
