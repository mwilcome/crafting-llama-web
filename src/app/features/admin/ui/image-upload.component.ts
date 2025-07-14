import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'image-upload',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './image-upload.component.html',
    styleUrls: ['./image-upload.component.scss'],
})
export class ImageUploadComponent {
    @Output() file = new EventEmitter<File>();
    drag = false;

    handle(event: DragEvent) {
        event.preventDefault();
        this.drag = false;
        const file = event.dataTransfer?.files?.[0];
        if (file) this.file.emit(file);
    }

    fileChosen(files: FileList) {
        if (files?.[0]) this.file.emit(files[0]);
    }
}
