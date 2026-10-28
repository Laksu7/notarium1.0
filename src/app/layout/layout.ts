import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Sidebar } from './sidebar';
import { Topbar } from './topbar';

@Component({
  selector: 'app-layout',
  imports: [RouterOutlet, Sidebar, Topbar],
  template: `
    <app-sidebar />
    <div class="shell-main">
      <app-topbar />
      <main class="shell-content">
        <router-outlet />
      </main>
    </div>
  `,
  styles: [
    `
      .shell-main { margin-left: 270px; min-height: 100vh; display: flex; flex-direction: column; }
      .shell-content { padding: 30px 34px 52px; flex: 1; }
    `,
  ],
})
export class Layout {}
