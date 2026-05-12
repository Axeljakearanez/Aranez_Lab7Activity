import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { finalize, first } from 'rxjs/operators';
import { Observable } from 'rxjs'; // Added for proper typing

import { AccountService, AlertService } from '@app/_services';
import { MustMatch } from '@app/_helpers';

@Component({ templateUrl: 'add-edit.component.html', standalone: false })
export class AddEditComponent implements OnInit, OnDestroy {
    form!: FormGroup;
    id?: string;
    title: string = 'Create Account';  // Initialized with a default value
    loading = false;
    submitting = false;
    submitted = false;

    private loadTimeoutId?: number;

    constructor(
        private formBuilder: FormBuilder,
        private route: ActivatedRoute,
        private router: Router,
        private accountService: AccountService,
        private alertService: AlertService,
        private cdr: ChangeDetectorRef
    ) {}

    ngOnInit() {
        this.id = this.route.snapshot.params['id'];

        // FormGroup initialization with validation
        this.form = this.formBuilder.group({
            title: ['', Validators.required],
            firstName: ['', Validators.required],
            lastName: ['', Validators.required],
            email: ['', [Validators.required, Validators.email]],
            role: ['', Validators.required],
            // password only required in add mode
            password: ['', [Validators.minLength(6), ...(!this.id ? [Validators.required] : [])]],
            confirmPassword: ['']
        }, {
            validator: MustMatch('password', 'confirmPassword') // Ensuring password and confirm password match
        });

        if (this.id) {
            this.title = 'Edit Account';
            this.loading = true;
            this.cdr.detectChanges();

            this.loadTimeoutId = window.setTimeout(() => {
                if (this.loading) {
                    this.loading = false;
                    this.alertService.error('Request timed out');
                    this.cdr.detectChanges();
                }
            }, 10000); // Timeout to prevent long wait

            this.accountService.getById(this.id)
                .pipe(
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
                    next: (account) => {
                        this.form.patchValue(account);  // Patches form with fetched account data
                        this.cdr.detectChanges();
                    },
                    error: (error) => {
                        this.alertService.error(error);
                        this.cdr.detectChanges();
                    }
                });
        }
    }

    ngOnDestroy() {
        if (this.loadTimeoutId) {
            window.clearTimeout(this.loadTimeoutId);
            this.loadTimeoutId = undefined;
        }
    }

    // Convenience getter for easy access to form fields
    get f() { return this.form.controls; }

    onSubmit() {
        this.submitted = true;
        this.cdr.detectChanges();

        this.alertService.clear();  // Reset alert on submit

        if (this.form.invalid) {
            return;
        }

        this.submitting = true;
        this.cdr.detectChanges();

        // Defined variable with type to remove red underlines
        let saveAccount: () => Observable<any>;
        let message: string;

        if (this.id) {
            saveAccount = () => {
                return this.accountService.update(this.id!, this.form.value);  // Update if in edit mode
            };
            message = 'Account updated';
        } else {
            saveAccount = () => {
                return this.accountService.register(this.form.value);  // Register if new account
            };
            message = 'Account created';
        }

        saveAccount()
            .pipe(first())
            .subscribe({
                next: () => {
                    this.alertService.success(message, { keepAfterRouteChange: true });
                    this.router.navigateByUrl('/admin/accounts');  // Navigate to accounts list
                },
                error: (err: any) => {
                    this.alertService.error(err);  // Display error message if request fails
                    this.submitting = false;
                    this.cdr.detectChanges();
                }
            });
    }
}