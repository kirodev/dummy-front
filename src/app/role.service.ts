// src/app/services/role.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RoleService {
  private isAdminSubject = new BehaviorSubject<boolean>(false);
  private isModeratorSubject = new BehaviorSubject<boolean>(false);

  constructor() { }

  setRoles(roles: string[]): void {
    this.isAdminSubject.next(roles.includes('ROLE_ADMIN'));
    this.isModeratorSubject.next(roles.includes('ROLE_MODERATOR'));
  }

  isAdmin(): Observable<boolean> {
    return this.isAdminSubject.asObservable();
  }

  isModerator(): Observable<boolean> {
    return this.isModeratorSubject.asObservable();
  }

  hasRole(role: string): boolean {
    if (role === 'ROLE_ADMIN') return this.isAdminSubject.getValue();
    if (role === 'ROLE_MODERATOR') return this.isModeratorSubject.getValue();
    return false;
  }
}
