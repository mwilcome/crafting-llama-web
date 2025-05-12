import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
    selector: 'app-design-card',
    standalone: true,
    templateUrl: './design-card.component.html',
    styleUrls: ['./design-card.component.css']
})
export class DesignCardComponent {
    @Input() design: any;
    @Output() select = new EventEmitter<void>();

    click(): void {
        // Only allow selection if the design is actionable
        if (this.design?.fields?.length || this.design?.variants?.length) {
            this.select.emit();
        }
    }
}
