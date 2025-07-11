import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MessageService } from '@core/catalog/message.service';
import { ContactMessage } from '@core/catalog/message.types';
import { Signal } from '@angular/core';

@Component({
    selector: 'app-messages',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './messages.component.html',
    styleUrls: ['./messages.component.scss'],
    providers: [MessageService]
})
export class MessagesComponent {
    readonly loading: Signal<boolean>;
    readonly messages: Signal<ContactMessage[]>;
    readonly hasUnread: Signal<boolean>;

    constructor(private readonly messageService: MessageService) {
        this.loading = this.messageService.loading;
        this.messages = this.messageService.messages;
        this.hasUnread = this.messageService.hasUnread;

        this.init();
    }

    private async init(): Promise<void> {
        await this.messageService.fetchMessages();
        await this.messageService.markAllAsViewed();
    }

    formatDate(dateStr: string): string {
        return new Date(dateStr).toLocaleString();
    }
}
