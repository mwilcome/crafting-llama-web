import {
    Component,
    EventEmitter,
    Input,
    Output,
    inject
} from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MessageService } from '@core/catalog/message.service';

@Component({
    selector: 'app-admin-menu',
    standalone: true,
    imports: [RouterLink, RouterLinkActive],
    templateUrl: './admin-menu.component.html',
    styleUrls: ['./admin-menu.component.scss'],
    providers: [MessageService]
})
export class AdminMenuComponent {
    @Input({ required: true }) collapsed = false;
    @Output() toggle = new EventEmitter<void>();

    readonly messageService = inject(MessageService);

    constructor() {
        this.messageService.fetchMessages();
    }
}
