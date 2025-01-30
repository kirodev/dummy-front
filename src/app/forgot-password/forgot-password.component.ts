import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../_services/auth.service';
import { Subject, takeUntil } from 'rxjs';

interface ApiError {
  error: {
    message: string;
  };
}

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.css']
})
export class ForgotPasswordComponent implements OnInit, OnDestroy {
  forgotPasswordForm: FormGroup;
  isLoading = false;
  email :string = '';
  successMessage: string | null = null;
  errorMessage: string | null = null;
  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private authService: AuthService
  ) {
    this.forgotPasswordForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  ngOnInit(): void {
    // Clear messages when email input changes
    this.forgotPasswordForm.get('email')?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.successMessage = null;
        this.errorMessage = null;
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.forgotPasswordForm.get(fieldName);
    return Boolean(
      field && field.invalid && (field.dirty || field.touched)
    );
  }

  onSubmit(): void {
    if (this.forgotPasswordForm.invalid) {
      this.forgotPasswordForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.successMessage = null;
    this.errorMessage = null;

    this.authService.forgotPassword(this.forgotPasswordForm.value.email)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.successMessage = 'A password reset link has been sent to your email address.';
          this.forgotPasswordForm.reset();
        },
        error: (err: ApiError) => {
          this.errorMessage = err.error?.message || 'Unable to process your request. Please try again later.';
        },
        complete: () => {
          this.isLoading = false;
        }
      });
  }
}
