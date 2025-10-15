import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class AuthTicketStatusMenuService {
    public openMenu$ = new Subject<void>();
    public closeMenu$ = new Subject<void>();

    requestOpenMenu(): void {
        this.openMenu$.next();
    }

    notifyCloseMenu(): void {
        this.closeMenu$.next();
    }
}