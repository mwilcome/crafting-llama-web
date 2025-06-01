import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Design } from '@core/catalog/design.types';

@Component({
    selector: 'app-design-card',
    standalone: true,
    templateUrl: './design-card.component.html',
    styleUrls: ['./design-card.component.scss'],
    imports: [CommonModule],
})
export class DesignCardComponent {
    @Input({ required: true }) design!: Design;
    protected readonly Array = Array;
}
