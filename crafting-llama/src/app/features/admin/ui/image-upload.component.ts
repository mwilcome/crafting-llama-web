import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'image-upload',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div
      class="uploader"
      (dragover)="drag = true; $event.preventDefault()"
      (dragleave)="drag = false"
      (drop)="handle($event)"
    >
      <p>@if (!drag) { Drag & drop image or click } @else { Release to upload }</p>
      <input type="file" accept="image/*" (change)="fileChosen($any($event.target).files)" />
    </div>
  `,
    styles: [
        `
      .uploader {
        border: 2px dashed #aaa;
        padding: 1rem;
        text-align: center;
        cursor: pointer;
        position: relative;
      }
      input[type='file'] {
        position: absolute;
        inset: 0;
        opacity: 0;
        cursor: pointer;
      }
    `,
    ],
})
export class ImageUploadComponent {
    @Output() file = new EventEmitter<File>();
    drag = false;

    handle(e: DragEvent) {
        e.preventDefault();
        this.drag = false;
        if (e.dataTransfer?.files?.[0]) this.file.emit(e.dataTransfer.files[0]);
    }
    fileChosen(files: FileList) {
        if (files?.[0]) this.file.emit(files[0]);
    }
}
