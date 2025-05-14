import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class LoaderService {
    private _counter = 0;
    private _loading$ = new BehaviorSubject(false);

    /** Observable used in the spinner component */
    loading$ = this._loading$.asObservable();

    show(): void {
        this._counter++;
        if (this._counter === 1) this._loading$.next(true);
    }

    hide(): void {
        if (this._counter === 0) return;
        this._counter--;
        if (this._counter === 0) this._loading$.next(false);
    }
}
