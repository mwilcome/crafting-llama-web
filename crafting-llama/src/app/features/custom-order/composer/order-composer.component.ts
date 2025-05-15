import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';

@Component({
    standalone: true,
    selector: 'app-order-composer',
    templateUrl: './order-composer.component.html',
    styleUrls: ['./order-composer.component.scss'],
    imports: [CommonModule, RouterOutlet],
})
export class OrderComposerComponent {}
