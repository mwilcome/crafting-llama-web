import { Component, inject } from '@angular/core';
import { GalleryService } from '@core/gallery/gallery.service';
import {FormsModule} from "@angular/forms";
import {RouterLink} from "@angular/router";

@Component({
    selector: 'app-gallery',
    standalone: true,
    templateUrl: './gallery.component.html',
    styleUrls: ['./gallery.component.scss'],
    imports: [
        FormsModule,
        RouterLink
    ]
})
export class GalleryComponent {
    private readonly gallery = inject(GalleryService);
    hydratedItems = this.gallery.items;
    filter = '';

    filteredItems() {
        const term = this.filter.trim().toLowerCase();
        if (!term) return this.hydratedItems();
        return this.hydratedItems().filter(item =>
            item.tags.some(tag => tag.toLowerCase().includes(term))
        );
    }
}
