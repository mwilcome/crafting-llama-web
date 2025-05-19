import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import {OrderSidebarComponent} from "@features/custom-order/order-sidebar/order-sidebar.component";

@Component({
    standalone: true,
    selector: 'app-order-composer',
    templateUrl: './order-composer.component.html',
    styleUrls: ['./order-composer.component.scss'],
    imports: [CommonModule, RouterOutlet, OrderSidebarComponent],
})
export class OrderComposerComponent {}
