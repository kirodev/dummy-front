import { Component, HostListener, OnInit, OnDestroy, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import { TokenStorageService } from './_services/token-storage.service';
import { RoleService } from './role.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit,AfterViewInit, OnDestroy {

  @ViewChild('protectedCanvas', { static: true }) canvasRef!: ElementRef<HTMLCanvasElement>;

  isLoggedIn = false;
  username!: string;
  showAdminBoard = false;
  showModeratorBoard = false;
  dropdownOpen = false; // Variable to toggle dropdown visibility
  private roleSubscriptions: Subscription[] = [];

  constructor(
    private tokenStorageService: TokenStorageService,
    private router: Router,
    private roleService: RoleService
  ) {}

  ngOnInit(): void {
    this.detectDevTools();

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

  // Listen for clicks outside of the dropdown to close it
  @HostListener('document:click', ['$event'])
  closeDropdown(event: Event): void {
    const dropdown = document.querySelector('.dropdown-menu');
    const dropdownToggle = document.querySelector('.dropdown a');

    // Close the dropdown only if the click is outside of it
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
    event.stopPropagation(); // Prevent clicks from propagating to the document
    this.dropdownOpen = !this.dropdownOpen;
  }

  ngOnDestroy(): void {
    // Unsubscribe to prevent memory leaks
    this.roleSubscriptions.forEach((sub) => sub.unsubscribe());
  }

  @HostListener('window:keydown', ['$event'])
  handleKeyDown(event: KeyboardEvent) {
    if (event.key === 'PrintScreen') {
      event.preventDefault();
      alert('Screenshot is disabled!');
    }
  }




  @HostListener('document:keydown', ['$event'])
  onKeydown(event: KeyboardEvent) {
    // Disable F12 and Ctrl+Shift+I (DevTools)
    if (
      event.key === 'F12' ||
      ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key === 'I')
    ) {
      event.preventDefault();
      alert('Inspect is disabled!');
    }
  }


  detectDevTools() {
    let devtoolsOpened = false;

    // Check for devtools
    const checkDevTools = () => {
      const before = performance.now();
      debugger;  // This pauses in devtools (if open)
      const after = performance.now();

      // If debugger pause took too long, devtools might be open
      if (after - before > 100) {
        if (!devtoolsOpened) {
          alert('DevTools detected. Please close it.');
          devtoolsOpened = true;
        }
      } else {
        devtoolsOpened = false;
      }
    };

    setInterval(checkDevTools, 1000);  // Check every second
  }

  @HostListener('window:keydown', ['$event'])
  disablePrintScreen(event: KeyboardEvent) {
    if (event.key === 'PrintScreen') {
      event.preventDefault();
      alert('Screenshots are disabled!');
    }
  }


}
