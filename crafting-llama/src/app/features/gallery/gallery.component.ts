import { Component, inject } from '@angular/core';
import {GalleryService} from "@core/gallery/gallery.service";

@Component({
    selector: 'app-gallery',
    standalone: true,
    templateUrl: './gallery.component.html',
    styleUrls: ['./gallery.component.scss'],
})
export class GalleryComponent {
    private readonly gallery = inject(GalleryService);

    hydratedItems = this.gallery.items;
}
