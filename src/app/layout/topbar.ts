import { Component, ElementRef, OnInit, inject } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';
import { AuthService } from '../core/auth';
import { initialsOf } from '../core/models';
import { UiIcon } from '../shared/icon';

@Component({
  selector: 'app-topbar',
  imports: [UiIcon],
  template: `
    <header class="tb">
      <div class="tb-crumb">
        <span class="tb-brand">NOTARIX</span>
        <span class="tb-sep">/</span>
        <span class="tb-page">{{ title }}</span>
      </div>

      <div class="tb-right">
        <button class="tb-bell" type="button" title="No new notifications">
          <ui-icon name="bell" size="19" />
          <i class="tb-dot"></i>
        </button>

        <span class="tb-divider"></span>

        <div class="tb-userwrap">
          <button class="tb-user" type="button" (click)="$event.stopPropagation(); menu = !menu">
            <span class="tb-avatar {{ auth.user?.role === 'admin' ? 'is-admin' : 'is-staff' }}">{{ initials() }}</span>
            <span class="tb-who">
              <b>{{ auth.user?.name }}</b>
              <small>{{ auth.user?.role === 'admin' ? 'Admin' : 'Staff' }}</small>
            </span>
            <ui-icon name="chev-down" size="15" />
          </button>

          @if (menu) {
            <div class="tb-menu">
              <div class="tb-menu-head">
                <b>{{ auth.user?.name }}</b>
                <small>{{ auth.user?.email }}</small>
              </div>
              <button type="button" class="tb-menu-logout" (click)="logout()">
                <ui-icon name="logout" size="16" />
                <span>Logout</span>
              </button>
            </div>
          }
        </div>
      </div>
    </header>
  `,
  styles: [
    `
      .tb {
        height: 64px;
        background: #fff;
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0 26px;
        border-bottom: 1px solid #ece8da;
        position: sticky;
        top: 0;
        z-index: 20;
      }
      .tb-crumb { display: flex; align-items: center; gap: 10px; }
      .tb-brand {
        font-size: 12px;
        letter-spacing: 0.24em;
        font-weight: 600;
        color: #9aa0a8;
      }
      .tb-sep { color: #b9bfc7; font-size: 14px; }
      .tb-page {
        font-family: 'Playfair Display', Georgia, serif;
        font-weight: 700;
        font-size: 19px;
        color: #1f3a5f;
      }

      .tb-right { display: flex; align-items: center; gap: 16px; }
      .tb-bell {
        position: relative;
        width: 38px;
        height: 38px;
        border: 0;
        background: transparent;
        border-radius: 10px;
        color: #5b6472;
        display: inline-flex;
        align-items: center;
        justify-content: center;
      }
      .tb-bell:hover { background: #f4f1e9; }
      .tb-dot {
        position: absolute;
        top: 7px;
        right: 9px;
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: #d5ae4f;
        border: 2px solid #fff;
      }
      .tb-divider { width: 1px; height: 26px; background: #e7e3d8; }

      .tb-userwrap { position: relative; }
      .tb-user {
        display: flex;
        align-items: center;
        gap: 11px;
        background: transparent;
        border: 0;
        padding: 6px 8px;
        border-radius: 12px;
        color: #9aa0a8;
      }
      .tb-user:hover { background: #f6f4ec; color: #5b6472; }
      .tb-avatar {
        width: 36px;
        height: 36px;
        border-radius: 50%;
        color: #fff;
        font-weight: 700;
        font-size: 12.5px;
        letter-spacing: 0.02em;
        display: grid;
        place-items: center;
      }
      .is-staff { background: #2f6d54; }
      .is-admin { background: #16305a; }
      .tb-who { text-align: left; line-height: 1.15; }
      .tb-who b { display: block; font-size: 14px; font-weight: 600; color: #22303f; }
      .tb-who small { font-size: 12px; color: #8a8f98; }

      .tb-menu {
        position: absolute;
        right: 0;
        top: calc(100% + 8px);
        min-width: 240px;
        background: #fff;
        border-radius: 12px;
        box-shadow: 0 18px 48px -12px rgba(15, 23, 32, 0.35);
        padding: 8px;
        z-index: 50;
      }
      .tb-menu-head { padding: 10px 12px 12px; border-bottom: 1px solid #f0ede3; }
      .tb-menu-head b { display: block; font-size: 14px; color: #22303f; }
      .tb-menu-head small { font-size: 12.5px; color: #8a8f98; }
      .tb-menu-logout {
        margin-top: 6px;
        width: 100%;
        display: flex;
        align-items: center;
        gap: 10px;
        border: 0;
        background: transparent;
        border-radius: 9px;
        padding: 10px 12px;
        font-size: 14px;
        color: #3f4954;
      }
      .tb-menu-logout:hover { background: #f6f3ea; color: var(--red); color: #b4483e; }
    `,
  ],
  host: { '(document:click)': 'menu = false' },
})
export class Topbar implements OnInit {
  auth = inject(AuthService);
  private router = inject(Router);

  title = '';
  menu = false;

  ngOnInit(): void {
    this.readTitle();
    this.router.events.pipe(filter((e) => e instanceof NavigationEnd)).subscribe(() => this.readTitle());
  }

  private readTitle(): void {
    let r = this.router.routerState.root.firstChild;
    let t = '';
    while (r) {
      if (r.snapshot.data?.['title']) t = r.snapshot.data['title'];
      r = r.firstChild;
    }
    this.title = t;
  }

  initials(): string {
    return initialsOf(this.auth.user?.name ?? '');
  }

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
