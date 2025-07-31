import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-lock-page',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './lock-page.component.html',
    styleUrls: ['./lock-page.component.scss'],
})
export class LockPageComponent {
    isLocked = signal(false);
    private tapTimes: number[] = [];
    private wakeLock: WakeLockSentinel | null = null;

    ngOnInit(): void {
        this.enableWakeLock();
    }

    onTap(): void {
        const now = Date.now();
        this.tapTimes.push(now);
        this.tapTimes = this.tapTimes.filter(t => now - t < 600);
        if (this.tapTimes.length >= 3) {
            this.isLocked.set(true);
        }
    }

    onUnlock(): void {
        this.isLocked.set(false);
    }

    private async enableWakeLock() {
        try {
            if ('wakeLock' in navigator) {
                this.wakeLock = await (navigator as any).wakeLock.request('screen');
            }
        } catch (err) {
            console.warn('Wake Lock not available:', err);
        }
    }
}
