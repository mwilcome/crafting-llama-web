import { Handler } from '@netlify/functions';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const resend = new Resend(process.env.RESEND_API_KEY);

export const handler: Handler = async () => {
    console.log('🔍 Starting send-reminder function');

    try {
        // Count messages where viewed = false
        const { count, error } = await supabase
            .from('contact_messages')
            .select('id', { count: 'exact' })
            .eq('viewed', false);

        if (error) {
            console.error('❌ Supabase query error:', error);
            throw error;
        }

        if (count && count > 0) {
            const subject = `You have ${count} unread message${count > 1 ? 's' : ''}`;
            const html = `
        <h2>You’ve got mail 🧵</h2>
        <p>You have <strong>${count}</strong> unread message${count > 1 ? 's' : ''} in your inbox.</p>
        <br/>
        <p style="font-style: italic;">With love,<br/>Mike</p>
      `;

            await resend.emails.send({
                from: 'no-reply@craftingllama.com',
                to: 'thecraftingllamastitching@gmail.com',
                subject,
                html,
            });

            console.log(`📬 Email sent for ${count} unread messages`);
        } else {
            console.log('✅ No unread messages to report.');
        }

        return {
            statusCode: 200,
            body: `Checked messages. Unread count: ${count}`,
        };
    } catch (err: any) {
        console.error('❌ Error occurred:', err);
        return {
            statusCode: 500,
            body: `Failed: ${err?.message || 'Unknown error'}`,
        };
    }
};
