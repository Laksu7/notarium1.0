import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { SettingsService } from '../../core/settings';
import { UiIcon } from '../../shared/icon';

@Component({
  selector: 'app-settings',
  imports: [FormsModule, RouterLink, UiIcon],
  template: `
    <div class="pg">
      <header class="page-head">
        <h1>System Settings</h1>
        <p>Office information shown on generated monthly reports.</p>
      </header>

      <div class="set-links">
        <a class="set-link" routerLink="/staff">
          <ui-icon name="users" size="18" />
          <span>Staff Accounts</span>
        </a>
        <a class="set-link" routerLink="/document-types">
          <ui-icon name="bank" size="18" />
          <span>Document Types</span>
        </a>
      </div>

      <section class="panel set-card">
        <label class="lbl set-lbl">Office Name</label>
        <input class="field" name="setName" [(ngModel)]="draft.name" placeholder="Notarial office name" />

        <label class="lbl set-lbl">Office Address</label>
        <input class="field" name="setAddress" [(ngModel)]="draft.address" placeholder="Street, City" />

        <label class="lbl set-lbl">Contact Number</label>
        <input class="field" name="setContact" [(ngModel)]="draft.contact" placeholder="09XXXXXXXXX" />

        <button class="btn btn-green set-save" type="button" (click)="save()">
          <ui-icon name="save" size="16" /> Save Settings
        </button>
        @if (saved()) {
          <span class="save-ok"><ui-icon name="check" size="15" /> Settings saved</span>
        }
      </section>
    </div>

    @if (toast()) {
      <div class="toast"><ui-icon name="check" size="16" /> {{ toast() }}</div>
    }
  `,
  styles: [
    `
      .set-links {
        display: flex;
        justify-content: space-between;
        gap: 16px;
        flex-wrap: wrap;
        max-width: 560px;
        margin-bottom: 22px;
      }
      .set-link {
        display: inline-flex;
        align-items: center;
        gap: 10px;
        background: #fff;
        border-radius: 12px;
        box-shadow: var(--shadow-card);
        padding: 14px 24px;
        font-weight: 600;
        font-size: 14.5px;
        color: #33404e;
        transition: 0.15s ease;
      }
      .set-link:hover { border: 0; outline: 2px solid #ead9a8; color: var(--navy); }
      .set-link .app-icon { color: #55606b; }

      .set-card { max-width: 560px; padding: 26px 26px 28px; }
      .set-lbl { margin-top: 6px; }
      .set-lbl + .field { margin-bottom: 0; }
      .set-save { margin-top: 24px; }
      .save-ok {
        margin-left: 14px;
        display: inline-flex;
        align-items: center;
        gap: 6px;
        font-size: 13.5px;
        font-weight: 600;
        color: #2e6b4f;
      }
    `,
  ],
})
export class Settings {
  private svc = inject(SettingsService);

  draft = { ...this.svc.settings };

  saved = signal(false);
  toast = signal<string | null>(null);
  private timer: ReturnType<typeof setTimeout> | undefined;

  save(): void {
    this.svc.save(this.draft);
    this.saved.set(true);
    this.toast.set('Office settings saved.');
    clearTimeout(this.timer);
    this.timer = setTimeout(() => {
      this.saved.set(false);
      this.toast.set(null);
    }, 2400);
  }
}
