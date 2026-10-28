import { Injectable, inject } from '@angular/core';
import { StorageService } from './storage';
import { User } from './models';

const USERS_KEY = 'notarixp.users';
const USER_KEY = 'notarixp.session';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private store = inject(StorageService);

  users: User[] = [];
  user: User | null = null;

  constructor() {
    this.users = this.store.read<User[] | null>(USERS_KEY, null) ?? this.seed();
    this.store.write(USERS_KEY, this.users);
    this.user = this.store.read<User | null>(USER_KEY, null);
  }

  private seed(): User[] {
    return [
      { id: 1, name: 'Administrator', email: 'admin@notarium.com', password: 'admin123', role: 'admin' },
      { id: 2, name: 'Jay Ann Bayarcal', email: 'secretary@notarium.com', password: 'staff123', role: 'staff' },
    ];
  }

  isAdmin(): boolean {
    return this.user?.role === 'admin';
  }

  login(email: string, password: string): boolean {
    const found = this.users.find(
      (u) => u.email.toLowerCase() === email.trim().toLowerCase() && u.password === password,
    );
    if (!found) return false;
    this.user = found;
    this.store.write(USER_KEY, found);
    return true;
  }

  logout(): void {
    this.user = null;
    localStorage.removeItem(USER_KEY);
  }

  /** Returns an error message, or null on success. */
  addStaff(name: string, email: string, password: string): string | null {
    if (!name.trim() || !email.trim() || !password.trim()) {
      return 'All fields are required.';
    }
    if (this.users.some((u) => u.email.toLowerCase() === email.trim().toLowerCase())) {
      return 'An account with this email address already exists.';
    }
    const nextId = this.users.reduce((m, u) => Math.max(m, u.id), 0) + 1;
    this.users = [...this.users, { id: nextId, name: name.trim(), email: email.trim(), password, role: 'staff' }];
    this.store.write(USERS_KEY, this.users);
    return null;
  }

  removeStaff(id: number): void {
    this.users = this.users.filter((u) => u.id !== id);
    this.store.write(USERS_KEY, this.users);
  }
}
