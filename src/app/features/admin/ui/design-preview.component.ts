import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Design } from '@core/catalog/design.types';
import { FieldRendererComponent } from '../ui/field-renderer.component';

@Component({
    standalone: true,
    selector: 'admin-design-preview',
    templateUrl: './design-preview.component.html',
    styleUrls: ['./design-preview.component.scss'],
    imports: [CommonModule, FieldRendererComponent],
})
export class DesignPreviewComponent {
    @Input() design: Design | null = null;
}
