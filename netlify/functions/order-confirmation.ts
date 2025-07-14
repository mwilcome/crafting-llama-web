import { Handler } from '@netlify/functions';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const resend = new Resend(process.env.RESEND_API_KEY);
const ADMIN_EMAIL = 'thecraftingllamastitching@gmail.com';
const FROM_EMAIL = 'no-reply@craftingllama.com';

export const handler: Handler = async (event) => {
    try {
        const { order_id } = JSON.parse(event.body || '{}');
        if (!order_id) throw new Error('Missing required order_id in request body');

        const { data: order, error: fetchOrderError } = await supabase
            .from('orders')
            .select('id, email, email_sent, created_at')
            .eq('id', order_id)
            .single();

        if (fetchOrderError || !order) throw new Error('Invalid or non-existent order');
        if (order.email_sent) throw new Error('Emails already sent for this order');
        const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
        if (order.created_at < fiveMinutesAgo) throw new Error('Order is too old to process confirmation');

        const orderNumber = order.id;
        const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px; background-color: #f9f9f9; color: #333;">
        <h2 style="text-align: center; color: #4a4a4a;">Order Confirmation – Custom Embroidery</h2>
        <p style="font-size: 16px; line-height: 1.5;">Thank you so much for your custom embroidery order! I’m excited to bring your vision to life.</p>
        <p style="font-size: 16px; line-height: 1.5;"><strong>Order Number:</strong> #${orderNumber}</p>
        <p style="font-size: 16px; line-height: 1.5;">This email is just to confirm that your order has been received. I’ll be reaching out shortly to gather any additional details I may need to complete your piece—so keep an eye on your inbox!</p>
        <p style="font-size: 16px; line-height: 1.5;">If you have any questions in the meantime or if there’s anything you’d like to add or clarify, feel free to reach out to me at <a href="mailto:${ADMIN_EMAIL}" style="color: #007bff;">${ADMIN_EMAIL}</a> or my <a href="https://instagram.com/thecraftingllama" style="color: #007bff;">Instagram page</a>.</p>
        <p style="font-size: 16px; line-height: 1.5;">Thank you again for supporting my work, I truly appreciate it!</p>
        <p style="font-size: 16px; line-height: 1.5; text-align: center; margin-top: 30px;">Warmly,<br>Tiffany Wilcome<br>The Crafting Llama</p>
        <p style="font-size: 14px; color: #777; text-align: center; margin-top: 20px;">
          Email: <a href="mailto:${ADMIN_EMAIL}" style="color: #007bff;">${ADMIN_EMAIL}</a><br>
          Instagram: <a href="https://instagram.com/thecraftingllama" style="color: #007bff;">@thecraftingllama</a>
        </p>
      </div>
    `;

        await Promise.all([
            resend.emails.send({
                from: FROM_EMAIL,
                to: ADMIN_EMAIL,
                subject: `Order Confirmation – Custom Embroidery [Order #${orderNumber}]`,
                html,
            }),
            resend.emails.send({
                from: FROM_EMAIL,
                to: order.email,
                subject: `Order Confirmation – Custom Embroidery [Order #${orderNumber}]`,
                html,
            }),
        ]);

        const { error: updateError } = await supabase
            .from('orders')
            .update({ email_sent: true })
            .eq('id', order_id);

        if (updateError) console.error('Failed to update email_sent:', updateError.message);

        return {
            statusCode: 200,
            body: JSON.stringify({ message: 'Confirmation emails sent successfully.' }),
        };
    } catch (err: any) {
        console.error('Error processing order confirmation:', err.message);
        return {
            statusCode: 400,
            body: JSON.stringify({ error: err.message }),
        };
    }
};