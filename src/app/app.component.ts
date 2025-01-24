import { Component, HostListener, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { TokenStorageService } from './_services/token-storage.service';
import { RoleService } from './role.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, OnDestroy {
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

  ngOnDestroy(): void {
    // Unsubscribe to prevent memory leaks
    this.roleSubscriptions.forEach((sub) => sub.unsubscribe());
  }
}
