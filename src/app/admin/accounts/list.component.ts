import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { finalize, first } from 'rxjs/operators';

import { AccountService, AlertService } from '@app/_services';

@Component({ templateUrl: 'list.component.html', standalone: false })
export class ListComponent implements OnInit, OnDestroy {
    accounts: any[] = []; // Array to hold the list of accounts
    loading = false; // Loading state for the spinner

    private loadTimeoutId?: number; // Stores the timeout ID for cleanup

    constructor(
        private accountService: AccountService,
        private alertService: AlertService,
        private cdr: ChangeDetectorRef
    ) {}

    ngOnInit() {
        this.loading = true;
        this.cdr.detectChanges();

        // 10-second timeout handling in case the API is slow
        this.loadTimeoutId = window.setTimeout(() => {
            if (this.loading) {
                this.loading = false;
                this.accounts = [];
                this.alertService.error('Request timed out');
                this.cdr.detectChanges();
            }
        }, 10000);

        // Fetch all accounts from the service
        this.accountService.getAll()
            .pipe(
                first(),
                finalize(() => {
                    this.loading = false;
                    if (this.loadTimeoutId) {
                        window.clearTimeout(this.loadTimeoutId);
                        this.loadTimeoutId = undefined;
                    }
                    this.cdr.detectChanges();
                })
            )
            .subscribe({
                next: accounts => {
                    this.accounts = accounts;
                    this.cdr.detectChanges();
                },
                error: error => {
                    this.alertService.error(error);
                    this.accounts = [];
                    this.cdr.detectChanges();
                }
            });
    }

    ngOnDestroy() {
        // Clear the timeout if the user leaves the page to prevent memory leaks
        if (this.loadTimeoutId) {
            window.clearTimeout(this.loadTimeoutId);
            this.loadTimeoutId = undefined;
        }
    }

    deleteAccount(id: string) {
        // Find the specific account to set its individual loading state
        const account = this.accounts.find(x => x.id === id);
        if (!account) return;

        account.isDeleting = true; // Shows the spinner on the specific delete button
        this.cdr.detectChanges();

        this.accountService.delete(id)
            .pipe(first())
            .subscribe(() => {
                // Remove the account from the local array once deleted successfully
                this.accounts = this.accounts.filter(x => x.id !== id);
                this.cdr.detectChanges();
            });
    }
}