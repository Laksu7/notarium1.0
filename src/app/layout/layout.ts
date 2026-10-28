import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { UiIcon } from '../shared/icon';
import { Sidebar } from './sidebar';
import { Topbar } from './topbar';

@Component({
  selector: 'app-layout',
  imports: [RouterOutlet, Sidebar, Topbar, UiIcon],
  template: `
    <button
      class="nav-toggle"
      type="button"
      title="Show / hide menu"
      [attr.aria-expanded]="navOpen()"
      (click)="navOpen.set(!navOpen())"
    >
      <ui-icon name="grid" size="18" />
    </button>
    <div class="shell" [class.nav-closed]="!navOpen()">
      <app-sidebar [class.sb-closed]="!navOpen()" />
      <div class="shell-main">
      <app-topbar [class.tb-shifted]="!navOpen()" />
        <main class="shell-content">
          <router-outlet />
        </main>
      </div>
    </div>
  `,
  styles: [
    `
      .shell { min-height: 100vh; }
      .shell-main { margin-left: 270px; min-height: 100vh; display: flex; flex-direction: column; }
      .shell-content { padding: 30px 34px 52px; flex: 1; }

      .nav-toggle {
        display: none;
        position: fixed;
        top: 15px;
        left: 15px;
        z-index: 75;
        width: 42px;
        height: 42px;
        align-items: center;
        justify-content: center;
        border-radius: 11px;
        background: #12332b;
        border: 1px solid #33594b;
        color: #e8c266;
        cursor: pointer;
        box-shadow: 0 10px 26px -12px rgba(18, 51, 43, 0.65);
      }

      /* Narrow windows (incl. high Windows display scaling): the sidebar
         slides away so record tables get full width; the button brings it back. */
      @media (max-width: 1140px) {
        .shell-main { margin-left: 0 !important; }
        .nav-toggle { display: flex; }
        app-sidebar { transition: transform 0.25s ease; }
        .nav-closed app-sidebar { transform: translateX(-104%); }
      }
    `,
  ],
})
export class Layout {
  /** closed by default on narrow windows; wide desktops always show it (CSS-driven) */
  navOpen = signal(false);
}
