import { Component, HostListener, OnInit, OnDestroy, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { Router } from '@angular/router';
import { TokenStorageService } from './_services/token-storage.service';
import { RoleService } from './role.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit,AfterViewInit , OnDestroy {
  @ViewChild('protectedCanvas', { static: true }) canvasRef!: ElementRef<HTMLCanvasElement>;

  isLoggedIn = false;
  username!: string;
  showAdminBoard = false;
  showModeratorBoard = false;
  dropdownOpen = false;
  private roleSubscriptions: Subscription[] = [];

  constructor(
    private tokenStorageService: TokenStorageService,
    private router: Router,
    private roleService: RoleService
  ) {}

  ngOnInit(): void {
    this.detectDevTools();
    this.blockClipboardCapture();

    this.isLoggedIn = !!this.tokenStorageService.getToken();
    if (this.isLoggedIn) {
      const user = this.tokenStorageService.getUser();
      this.roleService.setRoles(user.roles);
      this.username = user.username;

      // Subscribe to role changes
      this.roleSubscriptions.push(
        this.roleService.isAdmin().subscribe((isAdmin: boolean) => {
          this.showAdminBoard = isAdmin;
        })
      );

      this.roleSubscriptions.push(
        this.roleService.isModerator().subscribe((isModerator: boolean) => {
          this.showModeratorBoard = isModerator;
        })
      );
    }
  }

  ngAfterViewInit() {
    const canvas = this.canvasRef.nativeElement;
    const ctx = canvas.getContext('2d');

    if (ctx) {
      ctx.font = '30px Arial';
      ctx.fillStyle = 'black';
      ctx.fillText('Confidential Info - Canvas', 50, 50);
    }
  }
  logout(): void {
    this.tokenStorageService.signOut();
    this.router.navigate(['/login']);
  }

  @HostListener('document:click', ['$event'])
  closeDropdown(event: Event): void {
    const dropdown = document.querySelector('.dropdown-menu');
    const dropdownToggle = document.querySelector('.dropdown a');

    if (
      dropdown &&
      dropdownToggle &&
      !dropdown.contains(event.target as Node) &&
      !dropdownToggle.contains(event.target as Node)
    ) {
      this.dropdownOpen = false;
    }
  }

  toggleDropdown(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    this.dropdownOpen = !this.dropdownOpen;
  }

  ngOnDestroy(): void {
    this.roleSubscriptions.forEach((sub) => sub.unsubscribe());
  }

  @HostListener('document:keydown', ['$event'])
  onKeydown(event: KeyboardEvent) {
    if (
      event.key === 'F12' ||
      ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key === 'I')
    ) {
      event.preventDefault();
      alert('Inspect is disabled!');
    }
  }

  detectDevTools() {
    const devToolsDetectionInterval = setInterval(() => {
      const devtools = new Image();
      Object.defineProperty(devtools, 'id', {
        get: () => {
          alert('DevTools detected! Please close it.');
          clearInterval(devToolsDetectionInterval);
        },
      });
      console.log('%c', devtools);
    }, 1000);
  }

  @HostListener('window:keydown', ['$event'])
  disablePrintScreen(event: KeyboardEvent) {
    if (event.key === 'PrintScreen') {
      event.preventDefault();
      alert('Screenshots are disabled!');
    }
  }

  blockClipboardCapture() {
    document.addEventListener('copy', (e) => {
      alert('Copying content is disabled!');
      e.preventDefault();
    });

    // Prevent Print Screen via clipboard interception
    window.addEventListener('keyup', (e) => {
      if (e.key === 'PrintScreen') {
        navigator.clipboard.writeText('');
        alert('Screenshots are disabled!');
      }
    });
  }

  @HostListener('window:blur', ['$event'])
  detectSnippingTool() {
    setTimeout(() => {
      if (document.visibilityState === 'hidden') {
        alert('Snipping Tool or screenshot activity detected! Please disable it.');
      }
    }, 500);
  }
}
