import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/auth';
import { UiIcon } from '../../shared/icon';
import { UiModal } from '../../shared/modal';

@Component({
  selector: 'app-staff',
  imports: [FormsModule, UiIcon, UiModal],
  template: `
    <div class="pg">
      <header class="page-head">
        <h1>Staff Accounts</h1>
        <p>Manage secretary and staff accounts that can access the system.</p>
      </header>

      <button class="btn btn-green mb-btn" type="button" (click)="openAdd()">
        <ui-icon name="plus" size="16" /> Add Staff Account
      </button>

      <section class="panel">
        <div class="table-wrap">
          <table class="table">
            <thead>
              <tr>
                <th class="num-col">#</th>
                <th>Name</th>
                <th>Email Address</th>
                <th>Role</th>
                <th class="th-actions">Actions</th>
              </tr>
            </thead>
            <tbody>
              @for (u of auth.users; track u.id; let i = $index) {
                <tr>
                  <td class="idx">{{ i + 1 }}</td>
                  <td class="cell-strong">{{ u.name }}</td>
                  <td>{{ u.email }}</td>
                  <td>
                    @if (u.role === 'admin') {
                      <span class="badge badge-admin">Administrator</span>
                    } @else {
                      <span class="badge badge-staff">Secretary / Staff</span>
                    }
                  </td>
                  <td class="td-actions">
                    @if (u.id === auth.user?.id) {
                      <span class="muted">You</span>
                    } @else if (u.role === 'admin') {
                      <span class="muted">—</span>
                    } @else {
                      <button class="icon-btn danger" title="Remove account" type="button" (click)="pickDelete(u)">
                        <ui-icon name="trash" size="15" />
                      </button>
                    }
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </section>
    </div>

    <!-- add staff -->
    <ui-modal [open]="addOpen" title="Add Staff Account" width="480px" (close)="addOpen = false">
      <div class="form-grid">
        <div class="fg">
          <label class="lbl">Name<span class="lbl-req">*</span></label>
          <input
            class="field"
            name="sName"
            placeholder="Full name"
            [ngModel]="draft.name"
            (ngModelChange)="draft.name = $event"
          />
        </div>
        <div class="fg">
          <label class="lbl">Email Address<span class="lbl-req">*</span></label>
          <input
            class="field"
            type="email"
            name="sEmail"
            placeholder="staff@notarium.com"
            [ngModel]="draft.email"
            (ngModelChange)="draft.email = $event"
          />
        </div>
        <div class="fg">
          <label class="lbl">Password<span class="lbl-req">*</span></label>
          <input
            class="field"
            type="text"
            name="sPass"
            placeholder="Temporary password"
            [ngModel]="draft.password"
            (ngModelChange)="draft.password = $event"
          />
        </div>
        <p class="role-note">Role: <b>Secretary / Staff</b> — can view dashboard, records, and reports.</p>
        @if (addError) {
          <div class="form-error">{{ addError }}</div>
        }
      </div>
      <ng-template #foot>
        <button class="btn btn-light" type="button" (click)="addOpen = false">Cancel</button>
        <button class="btn btn-green" type="button" (click)="save()">Add Account</button>
      </ng-template>
    </ui-modal>

    <!-- delete confirm -->
    <ui-modal [open]="delPick !== null" title="Remove Account" width="440px" (close)="delPick = null">
      <p class="del-text">
        Remove staff account <b>{{ delPick?.name }}</b> ({{ delPick?.email }})? This account will no longer be able to
        sign in.
      </p>
      <ng-template #foot>
        <button class="btn btn-light" type="button" (click)="delPick = null">Cancel</button>
        <button class="btn btn-red" type="button" (click)="confirmDelete()">Remove</button>
      </ng-template>
    </ui-modal>
  `,
  styles: [
    `
      .mb-btn { margin: 0 0 22px; }
      .num-col { width: 56px; }
      .idx { color: #8a8f98; }
      .muted { color: #8a8f98; font-size: 13.5px; }

      .form-grid { display: grid; gap: 16px; }
      .role-note { font-size: 13px; color: #6b7280; }
      .role-note b { color: #3c4a58; }
      .form-error {
        font-size: 13px;
        color: #b4483e;
        background: #fdeeee;
        border: 1px solid #f2cfcf;
        border-radius: 9px;
        padding: 9px 12px;
      }
      .del-text { font-size: 14.5px; color: #3f4954; line-height: 1.6; }
    `,
  ],
})
export class Staff {
  auth = inject(AuthService);
  toast = signal<string | null>(null);
  private toastTimer: ReturnType<typeof setTimeout> | undefined;

  addOpen = false;
  addError = '';
  draft = { name: '', email: '', password: '' };

  delPick: { id: number; name: string; email: string } | null = null;

  openAdd(): void {
    this.draft = { name: '', email: '', password: '' };
    this.addError = '';
    this.addOpen = true;
  }

  save(): void {
    this.addError = '';
    const err = this.auth.addStaff(this.draft.name, this.draft.email, this.draft.password);
    if (err) {
      this.addError = err;
      return;
    }
    this.addOpen = false;
    this.showToast('Staff account added.');
  }

  pickDelete(u: { id: number; name: string; email: string }): void {
    this.delPick = u;
  }

  confirmDelete(): void {
    if (!this.delPick) return;
    this.auth.removeStaff(this.delPick.id);
    this.delPick = null;
    this.showToast('Staff account removed.');
  }

  private showToast(msg: string): void {
    this.toast.set(msg);
    clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => this.toast.set(null), 2400);
  }
}
