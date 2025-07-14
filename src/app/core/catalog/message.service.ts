import { inject } from '@angular/core';
import { signal } from '@angular/core';
import { SUPABASE_CLIENT } from '@core/supabase/supabase.client';
import { ContactMessage } from './message.types';

export class MessageService {
    private readonly supabase = inject(SUPABASE_CLIENT);
    readonly messages = signal<ContactMessage[]>([]);
    readonly loading = signal(true);
    readonly hasUnread = signal(false);

    async fetchMessages(): Promise<void> {
        this.loading.set(true);

        const res = await this.supabase
            .from('contact_messages')
            .select('*')
            .order('created_at', { ascending: false });

        if (!res.error && res.data) {
            this.messages.set(res.data as ContactMessage[]);
            this.hasUnread.set(res.data.some(m => !m.viewed));
        }

        this.loading.set(false);
    }

    async markAllAsViewed(): Promise<void> {
        console.log('markAllAsViewed');
        const current = this.messages();
        const unreadIds = current.filter(m => !m.viewed).map(m => m.id);

        const debug = await this.supabase
            .from('contact_messages')
            .update({ viewed: true })
            .in('id', unreadIds)
            .explain();

        console.log(debug);


        if (unreadIds.length === 0) return;

        const { error } = await this.supabase
            .from('contact_messages')
            .update({ viewed: true })
            .in('id', unreadIds);

        if (!error) {
            // Refresh messages after update
            await this.fetchMessages();
        }
    }
}
