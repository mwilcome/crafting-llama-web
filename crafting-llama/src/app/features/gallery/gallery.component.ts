import { Component, inject } from '@angular/core';
import { GalleryService }    from '@core/gallery/gallery.service';
import {storageUrl} from "@core/storage/storage-url";

@Component({
    selector: 'app-gallery',
    standalone: true,
    templateUrl: './gallery.component.html',
    styleUrls: ['./gallery.component.scss']
})
export class GalleryComponent {
    readonly items = inject(GalleryService).items;   // signal<GalleryItem[]>
    protected readonly storageUrl = storageUrl;
}
