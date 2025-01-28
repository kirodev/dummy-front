import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TokenStorageService } from '../_services/token-storage.service';
import { UserService } from '../_services/user.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css'],
})
export class ProfileComponent implements OnInit {
  currentUser: any;
  passwordForm = {
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  };
  showPopup: boolean = false;
  isLoading: boolean = false;
  successMessage: string | null = null;
  errorMessage: string | null = null;

  constructor(
    private token: TokenStorageService,
    private userService: UserService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.currentUser = this.token.getUser();
    if (!this.currentUser) {
      this.errorMessage = 'User is not logged in.';
      this.router.navigate(['/login']);
    }
  }

  openPopup(): void {
    this.showPopup = true;
  }

  closePopup(): void {
    this.showPopup = false;
    this.resetPasswordForm();
  }

  private resetPasswordForm(): void {
    this.passwordForm = { currentPassword: '', newPassword: '', confirmPassword: '' };
  }

  clearMessages(): void {
    this.successMessage = null;
    this.errorMessage = null;
  }

  changePassword(): void {
    if (this.passwordForm.newPassword !== this.passwordForm.confirmPassword) {
      this.errorMessage = 'Passwords do not match!';
      return;
    }

    const passwordCriteria = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordCriteria.test(this.passwordForm.newPassword)) {
      this.errorMessage =
        'Password must be at least 8 characters long, include an uppercase letter, a lowercase letter, a number, and a special character.';
      return;
    }

    this.isLoading = true;

    const payload = {
      currentPassword: this.passwordForm.currentPassword,
      newPassword: this.passwordForm.newPassword,
    };

    this.userService.changePassword(payload).subscribe({
      next: () => {
        this.successMessage = 'Password changed successfully!';
        this.errorMessage = null;
        this.closePopup();
      },
      error: (err) => {
        this.errorMessage =
          err?.error?.message || 'Something went wrong. Please try again later.';
      },
      complete: () => {
        this.isLoading = false;
      },
    });
  }
}
