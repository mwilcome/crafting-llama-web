import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import {OrderSidebarComponent} from "@features/custom-order/order-sidebar/order-sidebar.component";

@Component({
    selector: 'app-order-composer',
    standalone: true,
    templateUrl: './order-composer.component.html',
    styleUrls: ['./order-composer.component.scss'],
    imports: [RouterModule, OrderSidebarComponent],
})
export class OrderComposerComponent {}
