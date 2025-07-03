import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Design } from '@core/catalog/design.types';

@Component({
    standalone: true,
    selector: 'admin-design-preview',
    templateUrl: './design-preview.component.html',
    styleUrls: ['./design-preview.component.scss'],
    imports: [CommonModule],
})
export class DesignPreviewComponent {
    @Input() design: Design | null = null;
}
