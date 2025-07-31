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

    private wakeLock: WakeLockSentinel | null = null;
    private startDragX = 0;
    private startDragY = 0;
    private startMouseX = 0;
    private startMouseY = 0;
    private startTouchX = 0;
    private startTouchY = 0;
    private lastDistance = 0;
    private potentialBackSwipe = false;
    private startSwipeX = 0;

    private readonly MIN_SCALE = 0.2;
    private readonly MAX_SCALE = 4;

    ngOnInit(): void {
        this.enableWakeLock();
    }

    ngOnDestroy(): void {
        if (this.wakeLock) {
            this.wakeLock.release();
        }
        this.removeSwipeListeners();
    }

    toggleLock(): void {
        this.isLocked.update(v => !v);
        if (this.isLocked()) {
            this.addSwipeListeners();
        } else {
            this.removeSwipeListeners();
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

    onImageLoad(): void {
        if (!this.previewImage) return;
        const img = this.previewImage.nativeElement;
        const vw = window.innerWidth;
        const vh = window.innerHeight;
        const fitScale = Math.min(vw / img.naturalWidth, vh / img.naturalHeight);
        this.scale.set(fitScale);
        this.dragX.set((vw - img.naturalWidth * fitScale) / 2);
        this.dragY.set((vh - img.naturalHeight * fitScale) / 2);
        this.clampPosition();
    }

    getTransform(): string {
        return `scale(${this.scale()}) translate(${this.dragX()}px, ${this.dragY()}px)`;
    }

    onDragStart(event: DragEvent): void {
        if (this.isLocked() || !event.clientX || !event.clientY) return;
        this.startMouseX = event.clientX;
        this.startMouseY = event.clientY;
        this.startDragX = this.dragX();
        this.startDragY = this.dragY();
        event.preventDefault();
    }

    onDrag(event: DragEvent): void {
        if (this.isLocked() || !event.clientX || !event.clientY) return;
        const deltaX = (event.clientX - this.startMouseX) / this.scale();
        const deltaY = (event.clientY - this.startMouseY) / this.scale();
        this.dragX.set(this.startDragX + deltaX);
        this.dragY.set(this.startDragY + deltaY);
        this.clampPosition();
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
            const deltaX = (event.touches[0].clientX - this.startTouchX) / this.scale();
            const deltaY = (event.touches[0].clientY - this.startTouchY) / this.scale();
            this.dragX.set(this.startDragX + deltaX);
            this.dragY.set(this.startDragY + deltaY);
            this.clampPosition();
        } else if (event.touches.length === 2) {
            const touch1 = event.touches[0];
            const touch2 = event.touches[1];
            const px = (touch1.clientX + touch2.clientX) / 2;
            const py = (touch1.clientY + touch2.clientY) / 2;
            const newDistance = this.getDistance(event.touches);

            if (this.lastDistance > 0) {
                const factor = newDistance / this.lastDistance;
                const newScale = this.scale() * factor;
                const clampedScale = Math.max(this.MIN_SCALE, Math.min(newScale, this.MAX_SCALE));
                const ratio = clampedScale / this.scale();
                const newX = this.dragX() * ratio + px * (1 - ratio);
                const newY = this.dragY() * ratio + py * (1 - ratio);
                this.scale.set(clampedScale);
                this.dragX.set(newX);
                this.dragY.set(newY);
            }

            this.lastDistance = newDistance;
            this.clampPosition();
        }
    }

    private getDistance(touches: TouchList): number {
        const [a, b] = [touches[0], touches[1]];
        return Math.hypot(b.clientX - a.clientX, b.clientY - a.clientY);
    }

    private clampPosition(): void {
        if (!this.previewImage) return;
        const img = this.previewImage.nativeElement;
        const vw = window.innerWidth;
        const vh = window.innerHeight;
        const width = img.naturalWidth * this.scale();
        const height = img.naturalHeight * this.scale();

        // Extended range to allow full off-screen dragging (too big for screen, with overlap)
        let minX = -width;
        let maxX = vw;
        let minY = -height;
        let maxY = vh;

        this.dragX.set(Math.max(minX, Math.min(this.dragX(), maxX)));
        this.dragY.set(Math.max(minY, Math.min(this.dragY(), maxY)));
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

    private addSwipeListeners(): void {
        document.addEventListener('touchstart', this.handleTouchStart, { passive: false });
        document.addEventListener('touchmove', this.handleTouchMove, { passive: false });
        document.addEventListener('touchend', this.handleTouchEnd, { passive: false });
    }

    private removeSwipeListeners(): void {
        document.removeEventListener('touchstart', this.handleTouchStart);
        document.removeEventListener('touchmove', this.handleTouchMove);
        document.removeEventListener('touchend', this.handleTouchEnd);
    }

    private handleTouchStart = (event: TouchEvent): void => {
        if (event.touches.length === 1 && event.touches[0].clientX < 40) {
            this.potentialBackSwipe = true;
            this.startSwipeX = event.touches[0].clientX;
        } else {
            this.potentialBackSwipe = false;
        }
    };

    private handleTouchMove = (event: TouchEvent): void => {
        if (this.potentialBackSwipe && event.touches.length === 1) {
            const deltaX = event.touches[0].clientX - this.startSwipeX;
            if (deltaX > 10) {
                event.preventDefault();
            }
        }
    };

    private handleTouchEnd = (): void => {
        this.potentialBackSwipe = false;
    };
}