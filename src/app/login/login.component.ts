import { Component, OnInit, AfterViewInit, NgZone, Renderer2 } from '@angular/core';
import { TokenStorageService } from '../_services/token-storage.service';
import { AuthService } from '../_services/auth.service';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

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

  constructor(
    private authService: AuthService,
    private tokenStorage: TokenStorageService,
    private ngZone: NgZone,
    private sanitizer: DomSanitizer,
    private renderer: Renderer2
  ) { }

  ngOnInit(): void {
    if (this.tokenStorage.getToken()) {
      this.isLoggedIn = true;
      this.roles = this.tokenStorage.getUser().roles;
    }
  }

  ngAfterViewInit(): void {
    this.ngZone.runOutsideAngular(() => {
      setTimeout(() => {
        this.initializeBackground();
      }, 0);
    });
  }

  onSubmit(): void {
    this.authService.login(this.form).subscribe(
      data => {
        this.tokenStorage.saveToken(data.accessToken);
        this.tokenStorage.saveUser(data);

        this.isLoginFailed = false;
        this.isLoggedIn = true;
        this.roles = this.tokenStorage.getUser().roles;
        this.reloadPage();
      },
      err => {
        this.errorMessage = err.error.message;
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

      const tempDiv = document.createElement('div');
      for (let i = 0; i < squareLen; i++) {
        tempDiv.appendChild(square.cloneNode(true));
      }

      // Safely set sanitized HTML to background
      const sanitizedContent: SafeHtml = this.sanitizer.bypassSecurityTrustHtml(tempDiv.innerHTML);
      this.renderer.setProperty(background, 'innerHTML', sanitizedContent);
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
}
