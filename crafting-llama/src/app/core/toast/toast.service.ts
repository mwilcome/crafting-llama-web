import { Injectable } from '@angular/core';
import { BehaviorSubject, timer } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ToastService {
    private _msg$ = new BehaviorSubject<string | null>(null);
    readonly msg$ = this._msg$.asObservable();

    /** show for 4 s */
    show(message: string, ms = 4000) {
        this._msg$.next(message);
        timer(ms).subscribe(() => this._msg$.next(null));
    }
}
