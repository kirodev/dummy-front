import { Component, OnInit } from '@angular/core';
import { AuthService } from '../_services/auth.service';

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
export class ForgotPasswordComponent implements OnInit {
  email: string = '';
  isLoading = false;
  successMessage: string | null = null;
  errorMessage: string | null = null;

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    // Clear messages whenever the user changes input
    this.email = '';
    this.successMessage = null;
    this.errorMessage = null;
  }

  onSubmit(form: any): void {
    if (form.invalid) {
      console.log('Form is invalid');
      return;
    }

    console.log('Form is valid. Sending password reset request...');
    this.isLoading = true;

    this.authService.forgotPassword(this.email).subscribe({
      next: () => {
        console.log('Success response received');
        this.successMessage = 'A password reset link has been sent to your email address.';
        this.email = ''; // Clear the input after success
      },
      error: (err: ApiError) => {
        console.error('Error response received:', err);
        this.errorMessage = err.error?.message || 'Unable to process your request.';
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }
}
