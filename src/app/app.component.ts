// src/app/app.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
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
  private roleSubscriptions: Subscription[] = [];

  constructor(
    private tokenStorageService: TokenStorageService,
    private router: Router,
    private roleService: RoleService
  ) { }

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

  ngOnDestroy(): void {
    // Unsubscribe to prevent memory leaks
    this.roleSubscriptions.forEach(sub => sub.unsubscribe());
  }
}
