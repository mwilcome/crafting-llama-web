import { Component, inject, computed } from '@angular/core';
import { GalleryService, GalleryItem } from '@core/gallery/gallery.service';
import {FormsModule} from "@angular/forms";
import {RouterLink} from "@angular/router";
import { trigger, transition, style, animate } from '@angular/animations';

@Component({
    selector: 'app-gallery',
    standalone: true,
    templateUrl: './gallery.component.html',
    styleUrls: ['./gallery.component.scss'],
    imports: [
        FormsModule
    ],
    animations: [
        trigger('fadeIn', [
            transition(':enter', [
                style({ opacity: 0, transform: 'translateY(20px)' }),
                animate('300ms ease-out', style({ opacity: 1, transform: 'translateY(0)' })),
            ]),
        ])
    ]
})
export class GalleryComponent {
    private readonly gallery = inject(GalleryService);
    hydratedItems = this.gallery.items;
    filter = '';

    uniqueTags = computed(() => [...new Set(this.hydratedItems().flatMap(item => item.tags))].sort());

    selectedItem: GalleryItem | null = null;
    showPopup = false;

    filteredItems() {
        const term = this.filter.trim().toLowerCase();
        if (!term) return this.hydratedItems();
        return this.hydratedItems().filter(item =>
            item.tags.some(tag => tag.toLowerCase().includes(term))
        );
    }

    openPopup(item: GalleryItem) {
        this.selectedItem = item;
        this.showPopup = true;
    }

    closePopup() {
        this.showPopup = false;
        this.selectedItem = null;
    }

    shareToFacebook(item: GalleryItem) {
        const url = encodeURIComponent(window.location.origin + '/gallery/' + item.id);
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank');
    }

    shareToX(item: GalleryItem) {
        const url = encodeURIComponent(window.location.origin + '/gallery/' + item.id);
        const text = encodeURIComponent(item.title + ' - ' + item.description);
        window.open(`https://twitter.com/intent/tweet?url=${url}&text=${text}`, '_blank');
    }
}