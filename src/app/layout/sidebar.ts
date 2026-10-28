import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../core/auth';
import { UiIcon } from '../shared/icon';

@Component({
  selector: 'app-sidebar',
  imports: [RouterLink, RouterLinkActive, UiIcon],
  template: `
    <aside class="sb">
      <div class="sb-brand">
        <svg class="sb-logo" viewBox="0 0 64 64" fill="none" stroke="#d5ae4f" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="32" cy="9" r="1.4" fill="#d5ae4f" stroke="none" />
          <path d="M32 12v36" />
          <path d="M12 18h40" />
          <path d="M12 18l-7 11M12 18l7 11" />
          <path d="M2.5 29a9.5 7.5 0 0 0 19 0" />
          <path d="M52 18l-7 11M52 18l7 11" />
          <path d="M42.5 29a9.5 7.5 0 0 0 19 0" />
          <path d="M22 52h20" />
          <path d="M25 48h14" />
        </svg>
        <span class="sb-name">NOTARIX</span>
        <svg class="sb-swoosh" viewBox="0 0 70 10" width="70" height="10">
          <path d="M3 8 Q35 -3 67 8" stroke="#c9a544" stroke-width="1.6" fill="none" stroke-linecap="round" />
        </svg>
      </div>

      <nav class="sb-nav">
        @for (item of nav; track item.link) {
          <a class="sb-item" [routerLink]="item.link" routerLinkActive="on">
            <ui-icon [name]="item.icon" size="19" />
            <span>{{ item.label }}</span>
          </a>
        }

        @if (auth.isAdmin()) {
          <div class="sb-label">Administration</div>
          @for (item of adminNav; track item.link) {
            <a class="sb-item" [routerLink]="item.link" routerLinkActive="on">
              <ui-icon [name]="item.icon" size="19" />
              <span>{{ item.label }}</span>
            </a>
          }
        }
      </nav>

      <div class="sb-foot">
        <hr class="sb-rule" />
        <button class="sb-item sb-logout" (click)="logout()">
          <ui-icon name="logout" size="19" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  `,
  styles: [
    `
      .sb {
        position: fixed;
        top: 0;
        bottom: 0;
        left: 0;
        width: 270px;
        background: #12332b;
        display: flex;
        flex-direction: column;
        z-index: 30;
      }
      .sb-brand {
        padding: 26px 18px 20px;
        text-align: center;
        border-bottom: 1px solid rgba(255, 255, 255, 0.07);
      }
      .sb-logo { width: 56px; height: 56px; }
      .sb-name {
        display: block;
        margin-top: 8px;
        font-family: 'Playfair Display', Georgia, serif;
        font-weight: 700;
        letter-spacing: 0.26em;
        font-size: 21px;
        color: #fff;
        text-indent: 0.26em;
      }
      .sb-swoosh { margin-top: 6px; }

      .sb-nav { padding: 14px 10px; display: flex; flex-direction: column; gap: 4px; flex: 1; }
      .sb-item {
        display: flex;
        align-items: center;
        gap: 13px;
        padding: 12px 15px;
        border-radius: 12px;
        color: #c8d3ca;
        font-size: 14.5px;
        font-weight: 500;
        transition: 0.15s ease;
      }
      .sb-item:hover { background: rgba(255, 255, 255, 0.06); color: #fff; }
      .sb-item:active { background: rgba(255, 255, 255, 0.1); }
      .sb-item .app-icon { color: #90a795; transition: color 0.15s; }
      .sb-item.on { background: rgba(255, 255, 255, 0.09); color: #fff; }
      .sb-item.on .app-icon { color: #d5ae4f; }
      .sb-label {
        margin: 10px 6px 4px 16px;
        font-size: 10.5px;
        letter-spacing: 0.16em;
        text-transform: uppercase;
        color: rgba(233, 231, 221, 0.38);
        font-weight: 600;
      }

      .sb-foot { padding: 0 10px 14px; }
      .sb-rule {
        height: 2px;
        border: 0;
        margin: 8px 14px 10px;
        background: linear-gradient(90deg, transparent, rgba(213, 174, 79, 0.85), transparent);
      }
      .sb-logout {
        width: 100%;
        background: none;
        border: 0;
        text-align: left;
        color: #c8d3ca;
      }
      .sb-logout:hover { color: #fff; }

      /* narrow windows: slide the rail away when the layout closes it */
      .sb { transition: transform 0.25s ease; }
      @media (max-width: 1140px) {
        :host(.sb-closed) .sb { transform: translateX(-104%); }
      }
    `,
  ],
})
export class Sidebar {
  auth = inject(AuthService);
  private router = inject(Router);

  nav = [
    { label: 'Dashboard', link: '/dashboard', icon: 'grid' },
    { label: 'Notarization Records', link: '/records', icon: 'file' },
    { label: 'Reports', link: '/reports', icon: 'chart' },
  ];

  adminNav = [
    { label: 'Staff Accounts', link: '/staff', icon: 'users' },
    { label: 'Document Types', link: '/document-types', icon: 'bank' },
    { label: 'Office Settings', link: '/settings', icon: 'gear' },
  ];

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
