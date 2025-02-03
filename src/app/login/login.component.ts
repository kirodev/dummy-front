import { Component, OnInit, AfterViewInit, NgZone, Renderer2 } from '@angular/core';
import { TokenStorageService } from '../_services/token-storage.service';
import { AuthService } from '../_services/auth.service';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit, AfterViewInit {

  form: any = {};
  isLoggedIn = false;
  isLoginFailed = false;
  errorMessage = '';
  roles: string[] = [];
  username: string = '';
  isFirstLogin = true; // New variable for first-time login
  captchaResponse: string = '';  // Captures the reCAPTCHA response token
  isCaptchaInvalid: boolean = false;


  constructor(
    private authService: AuthService,
    private tokenStorage: TokenStorageService,
    private ngZone: NgZone,
    private sanitizer: DomSanitizer,
    private renderer: Renderer2,
    private router :Router
  ) { }

  ngOnInit(): void {
    if (this.tokenStorage.getToken()) {
      this.isLoggedIn = true;
      const user = this.tokenStorage.getUser();
      this.roles = user.roles;
      this.username = user.username; // Retrieve the username
      this.isFirstLogin = false; // Not the first login since token exists

    }
  }

  ngAfterViewInit(): void {
    this.ngZone.runOutsideAngular(() => {
      setTimeout(() => {
        this.initializeBackground();
      }, 0);
    });
  }

  onCaptchaResolved(captchaResponse: string): void {
    this.captchaResponse = captchaResponse;
    this.isCaptchaInvalid = false;  // Reset any previous invalid state
  }

  onSubmit(): void {
    if (!this.captchaResponse) {
      this.isCaptchaInvalid = true;  // Show error if captcha is not completed
      return;
    }

    const loginPayload = {
      ...this.form,
      captchaResponse: this.captchaResponse
    };

    this.authService.login(loginPayload).subscribe(
      data => {
        this.tokenStorage.saveToken(data.accessToken);
        this.tokenStorage.saveUser(data);
        this.isLoginFailed = false;
        this.isLoggedIn = true;
        const user = this.tokenStorage.getUser();
        this.roles = user.roles;
        this.username = user.username;
        this.isFirstLogin = false;
        this.reloadPage();
      },
      err => {
        this.errorMessage = err.error?.message || 'An error occurred.';
        this.isLoginFailed = true;
      }
    );
  }

  reloadPage(): void {
    window.location.reload();
  }

  initializeBackground(): void {
    const square = document.querySelector(".Square") as HTMLElement;
    const background = document.getElementById("Background");

    if (square && background) {
      const windowWidth = window.innerWidth || document.documentElement.clientWidth;
      const windowHeight = window.innerHeight || document.documentElement.clientHeight;
      const squareLen = Math.ceil((windowWidth / square.clientWidth) * (windowHeight / square.clientHeight));

      // Clear any existing children
      while (background.firstChild) {
        background.removeChild(background.firstChild);
      }

      // Create and append squares securely
      for (let i = 0; i < squareLen; i++) {
        const squareClone = this.renderer.createElement('div');
        this.renderer.addClass(squareClone, 'Square');
        this.renderer.listen(squareClone, 'click', this.activeSquare.bind(this));
        this.renderer.appendChild(background, squareClone);
      }
    }
  }


  activeSquare(event: MouseEvent): void {
    if (event.target instanceof HTMLElement) {
      if (event.target.classList.contains('active')) {
        this.renderer.removeClass(event.target, 'active');
      } else {
        this.renderer.addClass(event.target, 'active');
      }
    }
  }
  onForgotPassword(): void {
    // Navigate to a Forgot Password page
    this.router.navigate(['/forgot-password']);
  }

}
