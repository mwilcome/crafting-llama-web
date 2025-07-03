/****************************************************************
 * authGuard – awaits AuthService.init(), then checks session
 ****************************************************************/
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { CanActivateFn } from '@angular/router';
import { AuthService } from './auth.service';

export const authGuard: CanActivateFn = async () => {
    const auth   = inject(AuthService);
    const router = inject(Router);

    /* wait for Supabase to finish loading the session */
    await auth.waitUntilReady();

    if (auth.session()) return true;           // logged-in → proceed

    router.navigate(['/admin', 'login']);      // not authed → bounce
    return false;
};
