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
  username: string = '';

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
      const user = this.tokenStorage.getUser();
      this.roles = user.roles;
      this.username = user.username; // Retrieve the username
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
        const user = this.tokenStorage.getUser();
        this.roles = user.roles;
        this.username = user.username; // Retrieve the username
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
}
