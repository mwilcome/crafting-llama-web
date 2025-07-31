import { Component, ElementRef, OnDestroy, OnInit, ViewChild, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
    selector: 'app-lock-page',
    standalone: true,
    imports: [CommonModule, RouterLink],
    templateUrl: './lock-page.component.html',
    styleUrls: ['./lock-page.component.scss']
})
export class LockPageComponent implements OnInit, OnDestroy {
    isLocked = signal(false);
    imageUrl = signal<string | null>(null);
    scale = signal(1);
    dragX = signal(0);
    dragY = signal(0);

    @ViewChild('previewImage') previewImage?: ElementRef<HTMLImageElement>;

    private tapTimes: number[] = [];
    private wakeLock: WakeLockSentinel | null = null;
    private startDragX = 0;
    private startDragY = 0;
    private startMouseX = 0;
    private startMouseY = 0;
    private startTouchX = 0;
    private startTouchY = 0;
    private lastDistance = 0;

    ngOnInit(): void {
        this.enableWakeLock();
    }

    ngOnDestroy(): void {
        if (this.wakeLock) {
            this.wakeLock.release();
        }
    }

    onTap(): void {
        const now = Date.now();
        this.tapTimes.push(now);
        this.tapTimes = this.tapTimes.filter(t => now - t < 600);
        if (this.tapTimes.length >= 3) {
            this.isLocked.set(!this.isLocked());
            this.tapTimes = [];
        }
    }

    onImageSelected(event: Event): void {
        const file = (event.target as HTMLInputElement)?.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = () => this.imageUrl.set(reader.result as string);
            reader.readAsDataURL(file);
        }
    }

    getTransform(): string {
        return `translate(calc(-50% + ${this.dragX()}px), calc(-50% + ${this.dragY()}px)) scale(${this.scale()})`;
    }

    onDragStart(event: DragEvent): void {
        if (this.isLocked() || !event.clientX || !event.clientY) return;
        this.startMouseX = event.clientX;
        this.startMouseY = event.clientY;
        this.startDragX = this.dragX();
        this.startDragY = this.dragY();
        event.preventDefault(); // Prevent default drag behavior for images
    }

    onDrag(event: DragEvent): void {
        if (this.isLocked() || !event.clientX || !event.clientY) return;
        this.dragX.set(this.startDragX + (event.clientX - this.startMouseX));
        this.dragY.set(this.startDragY + (event.clientY - this.startMouseY));
    }

    onTouchStart(event: TouchEvent): void {
        if (this.isLocked()) return;

        if (event.touches.length === 1) {
            this.startTouchX = event.touches[0].clientX;
            this.startTouchY = event.touches[0].clientY;
            this.startDragX = this.dragX();
            this.startDragY = this.dragY();
        } else if (event.touches.length === 2) {
            this.lastDistance = this.getDistance(event.touches);
        }
    }

    onTouchMove(event: TouchEvent): void {
        if (this.isLocked()) return;

        if (event.touches.length === 1) {
            this.dragX.set(this.startDragX + (event.touches[0].clientX - this.startTouchX));
            this.dragY.set(this.startDragY + (event.touches[0].clientY - this.startTouchY));
        } else if (event.touches.length === 2 && !this.isLocked()) { // Explicitly check !isLocked() for pinch
            const newDistance = this.getDistance(event.touches);
            const delta = newDistance - this.lastDistance;
            this.lastDistance = newDistance;

            const newScale = this.scale() + delta / 200;
            this.scale.set(Math.max(0.2, Math.min(newScale, 4)));
        }
    }

    private getDistance(touches: TouchList): number {
        const [a, b] = [touches[0], touches[1]];
        return Math.hypot(b.clientX - a.clientX, b.clientY - a.clientY);
    }

    private async enableWakeLock() {
        try {
            if ('wakeLock' in navigator) {
                this.wakeLock = await navigator.wakeLock.request('screen');
            }
        } catch (err) {
            console.warn('Wake Lock not available:', err);
        }
    }
}