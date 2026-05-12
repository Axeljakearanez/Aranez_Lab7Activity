import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { first, finalize } from 'rxjs/operators';

import { AccountService, AlertService } from '@app/_services';

@Component({
  templateUrl: 'forgot-password.component.html',
  standalone: false
})
export class ForgotPasswordComponent implements OnInit {
  form!: FormGroup;
  loading: boolean = false;
  submitted: boolean = false;

  constructor(
    private formBuilder: FormBuilder,
    private accountService: AccountService,
    private alertService: AlertService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    // Initialize the form group with the 'email' form control and validation
    this.form = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]] // Ensure the email field is required and valid
    });
  }

  // Convenience getter for easy access to form controls
  get f() { 
    return this.form.controls; // Access the controls in the form group
  }

  onSubmit() {
    this.submitted = true; // Mark the form as submitted
    this.alertService.clear(); // Reset any previous alerts

    // Stop here if the form is invalid
    if (this.form.invalid) {
      return;
    }

    this.loading = true; // Set loading state to true while the request is in progress
    this.accountService.forgotPassword(this.f['email'].value) // Access email value using f['email']
      .pipe(first())
      .pipe(finalize(() => this.loading = false)) // Reset loading state after completion
      .subscribe({
        next: () => {
          this.alertService.success('Please check your email for password reset instructions');
        },
        error: (error) => {
          this.alertService.error(error); // Display the error if the request fails
        }
      });
  }
}