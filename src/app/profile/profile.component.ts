import { Component, OnInit } from '@angular/core';
import { TokenStorageService } from '../_services/token-storage.service';
import { UserService } from '../_services/user.service';
import { ToastrService } from 'ngx-toastr';

declare var bootstrap: any;

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

  constructor(
    private token: TokenStorageService,
    private userService: UserService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.currentUser = this.token.getUser();
  }

  openChangePasswordModal(): void {
    const modalElement = document.getElementById('changePasswordModal');
    const modal = new bootstrap.Modal(modalElement);
    modal.show();
  }



  private resetPasswordForm(): void {
    this.passwordForm = { currentPassword: '', newPassword: '', confirmPassword: '' };
    const modalElement = document.getElementById('changePasswordModal');
    const modal = bootstrap.Modal.getInstance(modalElement);
    modal.hide();
  }


  showPopup: boolean = false;
  openPopup(): void {
    this.showPopup = true;
  }

  closePopup(): void {
    this.showPopup = false;
  }

  changePassword(): void {
    if (this.passwordForm.newPassword !== this.passwordForm.confirmPassword) {
      this.toastr.error('Passwords do not match!', 'Error');
      return;
    }

    const payload = {
      currentPassword: this.passwordForm.currentPassword,
      newPassword: this.passwordForm.newPassword,
    };

    this.userService.changePassword(payload).subscribe({
      next: () => {
        this.toastr.success('Password changed successfully!', 'Success');
        this.closePopup(); // Close the popup
        this.passwordForm = { currentPassword: '', newPassword: '', confirmPassword: '' };
      },
      error: (err) => {
        console.error('Error changing password:', err); // Log the error for debugging
        const errorMessage =
          err?.error?.message || 'Something went wrong. Please try again later.';
        this.toastr.error(errorMessage, 'Error');
      },
    });
  }

}
