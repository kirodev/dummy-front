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
  isScreenBlocked = false;
  private clipboardInterval: any;

  constructor(
    private tokenStorageService: TokenStorageService,
    private router: Router,
    private roleService: RoleService
  ) {}

  ngOnInit(): void {
    this.setupClipboardMonitoring();
    this.detectScreenRecording();
    this.detectDevToolsTiming();
    this.monitorClipboardForScreenshots();
    this.detectScreenRecording();
    this.disableRightClick();
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
  ngAfterViewInit(): void {
    const canvas = this.canvasRef.nativeElement;
    const ctx = canvas.getContext('2d');

    if (ctx) {
      ctx.font = '30px Arial';
      ctx.fillStyle = 'black';
      ctx.fillText('Confidential Info - Canvas', 50, 50);
    }
  }



  ngOnDestroy(): void {
    clearInterval(this.clipboardInterval);
    this.roleSubscriptions.forEach((sub) => sub.unsubscribe());

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

  @HostListener('window:keydown', ['$event'])
  disableKeyShortcuts(event: KeyboardEvent): void {
    // Disable common shortcuts (Ctrl+S, Ctrl+C, Ctrl+V, F12, etc.)
    if (
      (event.ctrlKey && (event.key === 's' || event.key === 'c' || event.key === 'v')) ||
      event.key === 'F12' ||
      ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key === 'I')
    ) {
      event.preventDefault();
      alert('Shortcut disabled!');
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






  monitorClipboardForScreenshots(): void {
    setInterval(async () => {
      try {
        const clipboardItems = await navigator.clipboard.read();
        for (const item of clipboardItems) {
          const types = item.types;
          if (types.includes('image/png') || types.includes('image/jpeg')) {
            console.warn('Screenshot detected from clipboard!');
            this.blockScreenTemporarily();
            break;
          }
        }
      } catch (error) {
        console.error('Clipboard monitoring error:', error);
      }
    }, 2000);
  }














   // Monitor when tab visibility changes
   @HostListener('document:visibilitychange', ['$event'])
   handleVisibilityChange(): void {
     if (document.visibilityState === 'visible') {
       this.startClipboardMonitoring();
     } else {
       this.stopClipboardMonitoring();
     }
   }


   startClipboardMonitoring(): void {
     console.log('Starting clipboard monitoring...');
     this.clipboardInterval = setInterval(async () => {
       if (document.visibilityState === 'visible') {
         try {
           const clipboardItems = await navigator.clipboard.read();
           for (const item of clipboardItems) {
             const types = item.types;
             if (types.includes('image/png') || types.includes('image/jpeg')) {
               console.warn('Screenshot detected from clipboard!');
               this.blockScreenTemporarily();
               break;
             }
           }
         } catch (error : any) {
           if (error.name !== 'NotAllowedError') {
             console.error('Clipboard monitoring error:', error);
           }
         }
       }
     }, 3000);  // Check every 3 seconds
   }

   stopClipboardMonitoring(): void {
     console.log('Stopping clipboard monitoring...');
     clearInterval(this.clipboardInterval);
   }






   private clipboardMonitoring: any;


   setupClipboardMonitoring(): void {
    console.log('Starting clipboard monitoring...');
    // Check for clipboard access periodically but ensure the document is focused
    this.clipboardMonitoring = setInterval(() => {
      if (document.visibilityState === 'visible') {
        this.checkClipboard();
      }
    }, 5000); // Check every 5 seconds
  }

  async checkClipboard(): Promise<void> {
    if (!document.hasFocus()) {
      console.log('Clipboard access skipped: Document is not focused.');
      return; // Skip clipboard access if the page is not in focus
    }

    try {
      const clipboardItems = await navigator.clipboard.read();
      for (const item of clipboardItems) {
        if (item.types.includes('image/png') || item.types.includes('image/jpeg')) {
          console.warn('Screenshot detected from clipboard!');
          this.blockScreenTemporarily();
        }
      }
    } catch (error: any) {
      if (error.name === 'NotAllowedError') {
        console.log('Clipboard access not allowed or document not focused.');
      } else {
        console.error('Unexpected clipboard error:', error);
      }
    }
  }
  @HostListener('window:mousedown')
  @HostListener('window:keydown')
  async onUserInteraction(): Promise<void> {
    await this.checkClipboard();
  }


  blockScreenTemporarily(): void {
    this.isScreenBlocked = true;
    document.body.classList.add('screen-blocked');
    console.log('Screen blocked for 30 seconds...');
    setTimeout(() => {
      this.isScreenBlocked = false;
      document.body.classList.remove('screen-blocked');
      console.log('Screen unblocked.');
    }, 30000); // 30 seconds
  }

  detectDevToolsTiming(): void {
    let devToolsOpen = false;
    const interval = setInterval(() => {
      const start = performance.now();
      debugger;
      const end = performance.now();
      if (end - start > 100 && !devToolsOpen) {
        console.warn('DevTools detected!');
        devToolsOpen = true;
        this.blockScreenTemporarily();
      }
    }, 1000);
  }

  @HostListener('window:keydown', ['$event'])
  onKeydown(event: KeyboardEvent): void {
    if (
      event.key === 'PrintScreen' ||
      (event.ctrlKey && event.key === 'p') ||
      (event.ctrlKey && event.shiftKey && event.key === 's')
    ) {
      event.preventDefault();
      console.warn('Screenshot or print attempt detected.');
      this.blockScreenTemporarily();
    }
  }
}
