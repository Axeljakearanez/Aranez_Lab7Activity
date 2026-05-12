import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { first, finalize } from 'rxjs/operators';

import { AccountService, AlertService } from '@app/_services';

@Component({
  templateUrl: 'login.component.html',
  standalone: false
})
export class LoginComponent implements OnInit {
  form!: FormGroup;
  submitting: boolean = false;
  submitted: boolean = false;

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private accountService: AccountService,
    private alertService: AlertService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    // Initialize the form with 'email' and 'password' fields with validation
    this.form = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]], // email required and should be valid
      password: ['', Validators.required] // password required
    });
  }

  // Convenience getter for easy access to form fields
  get f() { return this.form.controls; }

  onSubmit() {
    this.submitted = true; // Mark the form as submitted
    this.alertService.clear(); // Reset any alerts before submission

    // Stop here if the form is invalid
    if (this.form.invalid) {
      return;
    }

    this.submitting = true; // Set submitting to true while the request is in progress
    this.cdr.detectChanges(); // Ensure change detection is triggered

    // Call the login method in the account service and subscribe to the observable
    this.accountService.login(this.f['email'].value, this.f['password'].value)
      .pipe(first())
      .pipe(finalize(() => {
        this.submitting = false; // Reset submitting after completion
        this.cdr.detectChanges(); // Ensure change detection is triggered
      }))
      .subscribe({
        next: () => {
          const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
          this.router.navigateByUrl(returnUrl); // Navigate to returnUrl after successful login
        },
        error: (error) => {
          setTimeout(() => {
            this.alertService.error(error); // Display error message if the login fails
            this.submitting = false;
            this.cdr.detectChanges();
          });
        }
      });
  }
}