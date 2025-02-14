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
  private holdTimeout: any;
  private holdDuration = 500;
  private isHolding = false;
  isLoggedIn = false;
  username!: string;
  showAdminBoard = false;
  showModeratorBoard = false;
  dropdownOpen = false; // Variable to toggle dropdown visibility
  private roleSubscriptions: Subscription[] = [];
  isScreenBlocked = false;
  private clipboardInterval: any;
  private isBlocking = false;
  private isDragging = false;
  private dragTimeout: any;

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
  this.setupHoldListeners();

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



  @HostListener('window:keyup', ['$event'])
  async onKeyup(event: KeyboardEvent): Promise<void> {
    if (event.key === 'PrintScreen' || event.keyCode === 44) {
      event.preventDefault();
      event.stopPropagation();

      console.warn('Print Screen key pressed, replacing clipboard content.');

      // Show the black screen overlay
      this.showBlackScreen();

      try {
        // Create an image blob from restricted.PNG
        const imageBlob = await this.getImageBlob('assets/restricted.PNG');
        await this.copyImageToClipboard(imageBlob);

        console.log('Successfully replaced clipboard content with a restricted image.');
      } catch (error) {
        console.error('Error replacing clipboard content:', error);
      }

      // Optional: Hide the black screen after a delay
      setTimeout(() => {
        this.hideBlackScreen();
      }, 1000);
    }
  }

  /**
   * Fetch the image as a Blob.
   * @param imagePath Path to the image.
   */
  private async getImageBlob(imagePath: string): Promise<Blob> {
    const response = await fetch(imagePath);
    if (!response.ok) {
      throw new Error('Failed to load image for clipboard replacement.');
    }
    return await response.blob();
  }

  /**
   * Copy the given image blob to the clipboard.
   * @param imageBlob The image blob to copy.
   */
  private async copyImageToClipboard(imageBlob: Blob): Promise<void> {
    const clipboardItem = new ClipboardItem({ 'image/png': imageBlob });
    await navigator.clipboard.write([clipboardItem]);
  }


  @HostListener('window:keydown', ['$event'])
  disableKeyShortcuts(event: KeyboardEvent): void {
    if (
      event.key === 'PrntScrn' ||
    event.key === 'F12' ||
      event.key === 'PrintScreen' ||
      (event.ctrlKey && event.shiftKey && event.key.toLowerCase() === 'i') ||
      (event.ctrlKey && event.key.toLowerCase() === 'u') ||
      (event.key === 'F12') ||
      (event.ctrlKey && event.key.toLowerCase() === 's') ||
      (event.ctrlKey && event.key.toLowerCase() === 'p')
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
    this.removeHoldListeners();
  }

  ngAfterViewInit(): void {
    console.log('App view initialized');
  }


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

  private setupHoldListeners(): void {
    document.addEventListener('mousedown', this.onMouseDown.bind(this));
    document.addEventListener('mouseup', this.onMouseUp.bind(this));
  }

  private removeHoldListeners(): void {
    document.removeEventListener('mousedown', this.onMouseDown.bind(this));
    document.removeEventListener('mouseup', this.onMouseUp.bind(this));
  }



  /**
   *
   * Handle mouse down event.
   */


  /**
   * Show the black screen overlay.
   */
  private showBlackScreen(): void {
    const overlay = document.getElementById('black-screen-overlay');
    if (overlay) {
      overlay.classList.add('show');
    }

    // Automatically hide the overlay after a short duration
    setTimeout(() => {
      this.hideBlackScreen();
    }, 1000); // 3 seconds display duration
  }

  /**
   * Hide the black screen overlay.
   */
  private hideBlackScreen(): void {
    const overlay = document.getElementById('black-screen-overlay');
    if (overlay) {
      overlay.classList.remove('show');
    }
  }




  private onMouseDown(event: MouseEvent): void {
    const isScrollbarClicked = this.isScrollbarRegion(event);

    if (isScrollbarClicked) {
      console.log('Scrollbar clicked, skipping hold logic.');
      return; // Skip the hold logic if the scrollbar is clicked
    }

    this.isHolding = false;

    // Start a timer to trigger the black screen after 0.5 seconds
    this.holdTimeout = setTimeout(() => {
      this.isHolding = true;
      this.showBlackScreen();
    }, this.holdDuration);
  }

  private isScrollbarRegion(event: MouseEvent): boolean {
    const scrollBarWidth = window.innerWidth - document.documentElement.clientWidth;
    const scrollBarHeight = window.innerHeight - document.documentElement.clientHeight;

    // Check if click is in vertical or horizontal scrollbar regions
    const isVerticalScrollBar = event.clientX >= window.innerWidth - scrollBarWidth;
    const isHorizontalScrollBar = event.clientY >= window.innerHeight - scrollBarHeight;

    return isVerticalScrollBar || isHorizontalScrollBar;
  }

  private onMouseUp(): void {
    clearTimeout(this.holdTimeout);

    // If the user releases early, reset the hold state and hide the black screen
    if (!this.isHolding) {
      this.hideBlackScreen(); // Ensure it doesn't stay on if the user released quickly
    }
  }

}
