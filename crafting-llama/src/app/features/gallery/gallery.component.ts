import { Component, signal } from '@angular/core';

interface GalleryItem {
    imageUrl: string;
    caption: string;
    tags: string[];
    date: string;
}

@Component({
    selector: 'app-gallery',
    standalone: true,
    templateUrl: './gallery.component.html',
    styleUrls: ['./gallery.component.scss']
})
export class GalleryComponent {
    readonly items = signal<GalleryItem[]>([
        {
            imageUrl: '/assets/images/mock-product-3.png',
            caption: 'Floral embroidery in hoop',
            tags: ['floral', 'hoop', 'spring'],
            date: '2025-06-01'
        },
        {
            imageUrl: '/assets/images/mock-product-3.png',
            caption: 'Detailed name patch with vines',
            tags: ['name', 'green', 'gift'],
            date: '2025-05-28'
        }
    ]);
}
