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
  private screenBlockTimeout: any;

  isLoggedIn = false;
  username!: string;
  showAdminBoard = false;
  showModeratorBoard = false;
  dropdownOpen = false; // Variable to toggle dropdown visibility
  private roleSubscriptions: Subscription[] = [];
  isScreenBlocked = false;
  private clipboardInterval: any;
  private isBlocking = false;
  constructor(
    private tokenStorageService: TokenStorageService,
    private router: Router,
    private roleService: RoleService,


  ) {}

  private globalKeyListener(event: KeyboardEvent): void {
    if (this.isRestrictedKeyCombination(event)) {
      this.preventAction(event);
    }
  }
  ngOnInit(): void {
  this.disableRightClick();
    document.addEventListener('keydown', this.globalKeyListener.bind(this));

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


  disableRightClick(): void {
    document.addEventListener('contextmenu', (e) => {
      e.preventDefault();
    });
  }




  @HostListener('window:keydown', ['$event'])
  disablePrintScreen(event: KeyboardEvent): void {
    if (event.key === 'PrintScreen') {
      event.preventDefault();
      this.blockScreenTemporarily();
    }
  }



  // Detect combinations like Windows + Print Screen, Fn + PrintScreen




  detectScreenRecording(): void {
    try {
      navigator.mediaDevices.ondevicechange = () => {
        console.warn('Screen recording detected!');
        this.blockScreenTemporarily();
      };
    } catch (error) {
      console.error('Error detecting screen recording:', error);
    }
  }



















  detectDevToolsTiming(): void {
    const start = performance.now();
    debugger;  // DevTools pause detection
    const end = performance.now();
    if (end - start > 100) {
      console.warn('DevTools detected.');
      alert('DevTools are disabled!');
      this.blockScreenTemporarily();
    }
  }




   private clipboardCheckEnabled = false;












   @HostListener('window:keyup', ['$event'])
   onKeyup(event: KeyboardEvent): void {
     if (event.keyCode === 44) {  // Print Screen key (VK_SNAPSHOT)
       event.preventDefault();
       event.stopPropagation();

       console.warn('Print Screen key pressed, blocking screen immediately!');
       this.showBlackScreen();  // Show the black screen instantly

       // Optional: Start a brief timeout to reset or check clipboard if needed
       setTimeout(() => {
         this.hideBlackScreen();  // Optionally hide after 10s or once clipboard is checked
       }, 1000);
     }
   }


   private showBlackScreen(): void {
    const overlay = document.getElementById('black-screen-overlay');
    if (overlay) {
      overlay.style.transition = 'none';  // Disable transitions for instant effect
      overlay.classList.add('show');  // Show the overlay instantly
    }
    setTimeout(() => {
      this.hideBlackScreen();
      this.isBlocking = false;
      console.log('Screen unblocked.');
    }, 1000);
  }


  @HostListener('window:keydown', ['$event'])
  disableKeyShortcuts(event: KeyboardEvent): void {
    if (
      event.key === 'PrntScrn' ||
    event.key === 'F12' ||
      event.key === 'PrintScreen' ||                                            // Print Screen
      (event.ctrlKey && event.shiftKey && event.key.toLowerCase() === 'i') ||   // Ctrl + Shift + I
      (event.ctrlKey && event.key.toLowerCase() === 'u') ||                     // Ctrl + U (view source)
      (event.key === 'F12') ||                                                  // F12 (DevTools)
      (event.ctrlKey && event.key.toLowerCase() === 's') ||                     // Ctrl + S (save)
      (event.ctrlKey && event.key.toLowerCase() === 'p')                        // Ctrl + P (print)
    ) {
      event.preventDefault();
      console.warn('Restricted key combination or PrintScreen detected.');

      // Trigger black screen overlay
      this.showBlackScreen();
    }
  }





  private preventAction(event: KeyboardEvent): void {
    event.preventDefault();
    event.stopPropagation();  // Stop it from propagating further

    if (!this.isBlocking) {
      this.isBlocking = true;
      this.blockScreenTemporarily();  // Block for 10 seconds
    }
  }





  private clipboardCheckRunning = false;



















  ngOnDestroy(): void {
    console.log('App destroyed');
  }

  ngAfterViewInit(): void {
    console.log('App view initialized');
  }





















  private clipboardCheckDone = false;




  private blockScreenTemporarily(): void {
    console.log('Triggering immediate black screen...');
    this.showBlackScreen();

    setTimeout(() => {
      this.hideBlackScreen();
      this.isBlocking = false;  // Allow future triggers
      console.log('Screen unblocked.');
    }, 1000);  // 10 seconds block
  }






































  @HostListener('window:keydown', ['$event'])
  onKeydown(event: KeyboardEvent): void {
    if (this.isRestrictedKeyCombination(event)) {
      event.preventDefault();  // Prevent the key's default action (if possible)
      console.warn('Restricted key or Print Screen detected.');

      if (!this.isBlocking) {
        this.triggerImmediateBlock();  // Show black screen
        this.checkClipboardOnce();  // Check clipboard once for screenshot
      }
    }
  }

  /**
   * Checks the clipboard once for image content (screenshots)
   */
  private checkClipboardOnce(): void {
    if (this.clipboardCheckRunning) {
      console.log('Skipping clipboard check: Already running.');
      return;
    }

    this.clipboardCheckRunning = true;

    navigator.clipboard.read().then((clipboardItems) => {
      for (const item of clipboardItems) {
        if (item.types.includes('image/png') || item.types.includes('image/jpeg')) {
          console.warn('Screenshot detected from clipboard!');
          this.showBlackScreen();
          return;
        }
      }
      console.log('No screenshot detected. Hiding black screen early.');
      this.hideBlackScreen();  // Hide the black screen early if no screenshot is found
      this.isBlocking = false;
    }).catch((error) => {
      console.error('Clipboard read error:', error);
      this.hideBlackScreen();  // Fallback to hide the black screen in case of error
      this.isBlocking = false;
    }).finally(() => {
      this.clipboardCheckRunning = false;
    });
  }

  /**
   * Triggers the black screen to block content for 10 seconds
   */
  private triggerImmediateBlock(): void {
    this.isBlocking = true;
    this.showBlackScreen();
    console.log('Triggering immediate black screen...');


  }

  /**
   * Determines if the key combination is restricted
   */
  private isRestrictedKeyCombination(event: KeyboardEvent): boolean {
    return (
      event.key === 'PrintScreen' ||
      event.key === 'F12' ||
      (event.ctrlKey && event.shiftKey && event.key.toLowerCase() === 'i') ||
      (event.ctrlKey && event.key.toLowerCase() === 'u') ||
      (event.ctrlKey && event.key.toLowerCase() === 's') ||
      (event.ctrlKey && event.key.toLowerCase() === 'p')
    );
  }


  /**
   * Hides the black screen overlay
   */
  private hideBlackScreen(): void {
    const overlay = document.getElementById('black-screen-overlay');
    if (overlay) {
      overlay.classList.remove('show');
    }
  }
}
