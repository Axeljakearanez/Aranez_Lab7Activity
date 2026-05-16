import { Injectable } from '@angular/core';
import { Router, ActivatedRouteSnapshot, RouterStateSnapshot, CanActivate } from '@angular/router';
import { AccountService } from '@app/_services';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
    constructor(
        private router: Router,
        private accountService: AccountService
    ) {}

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
        const account = this.accountService.accountValue;

        // not logged in so redirect to login page with the return url
        if (!account) {
            this.router.navigate(['/account/login'], { queryParams: { returnUrl: state.url } });
            return false;
        }

        // check if route is restricted by role
        if (route.data['roles'] && !route.data['roles'].includes(account.role)) {
            // role not authorized so redirect to home page
            this.router.navigate(['']);
            return false;
        }

        // authorized so return true
        return true;
    }
}