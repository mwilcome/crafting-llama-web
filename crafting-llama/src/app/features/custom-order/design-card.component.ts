import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-design-card',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './design-card.component.html',
    styleUrls: ['./design-card.component.scss']
})
export class DesignCardComponent {
    @Input() design: any;
    @Input() selected: boolean = false;
    @Output() select = new EventEmitter<void>();

    click(): void {
        if (this.design?.fields?.length || this.design?.variants?.length) {
            this.select.emit();
        }
    }
}
