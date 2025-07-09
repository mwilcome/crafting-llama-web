import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '@core/auth/auth.service';

@Component({
    selector: 'app-admin-login',
    standalone: true,
    imports: [CommonModule, FormsModule],
    template: `
        <h2>Admin Login</h2>

        @if (!sent()) {
            <form (ngSubmit)="send()">
                <label>
                    Email
                    <input
                            type="email"
                            [(ngModel)]="email"
                            name="email"
                            required
                            autocomplete="email" />
                </label>

                <button type="submit">Send magic link</button>
                <p class="error" *ngIf="error">{{ error }}</p>
            </form>
        } @else {
            <p>   ✅ Check your inbox and click the link to finish signing in.</p>
        }
    `
})
export class LoginPageComponent {
    private auth = inject(AuthService);

    email  = '';
    error  = '';
    sent   = signal(false);

    async send(): Promise<void> {
        const { error } = await this.auth.signIn(this.email);
        if (error) { this.error = error.message; return; }
        this.sent.set(true);
    }
}
