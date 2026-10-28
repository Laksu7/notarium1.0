import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DocTypesService } from '../../core/doctypes';
import { NotarizationRecord } from '../../core/models';
import { UiIcon } from '../../shared/icon';
import { UiModal } from '../../shared/modal';

@Component({
  selector: 'app-doctypes',
  imports: [FormsModule, UiIcon, UiModal],
  template: `
    <div class="pg">
      <header class="page-head">
        <h1>Document Types</h1>
        <p>Categories used when recording notarized documents.</p>
      </header>

      <section class="panel dt-bar">
        <input
          class="field dt-input"
          name="dtNew"
          placeholder="New document type name (e.g. Affidavit of Expense)"
          [(ngModel)]="newName"
          (keyup.enter)="add()"
        />
        <button class="btn btn-green" type="button" (click)="add()">
          <ui-icon name="plus" size="16" /> Add Type
        </button>
      </section>
      @if (error) {
        <div class="dt-error no-print">{{ error }}</div>
      }

      <section class="panel">
        <div class="table-wrap">
          <table class="table">
            <thead>
              <tr>
                <th>Document Type</th>
                <th>Records</th>
                <th class="th-actions">Actions</th>
              </tr>
            </thead>
            <tbody>
              @for (t of types(); track t.id) {
                <tr>
                  <td class="serif-name">{{ t.name }}</td>
                  <td class="rec-count">{{ countFor(t.name) }} record(s)</td>
                  <td class="td-actions">
                    @if (countFor(t.name) > 0) {
                      <span class="in-use">In use</span>
                    } @else {
                      <button class="icon-btn danger" title="Delete type" type="button" (click)="pickDelete(t)">
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

    <!-- delete confirm -->
    <ui-modal [open]="delPick !== null" title="Delete Document Type" width="440px" (close)="delPick = null">
      <p class="del-text">
        Delete document type <b>{{ delPick?.name }}</b>? This cannot be undone.
      </p>
      <ng-template #foot>
        <button class="btn btn-light" type="button" (click)="delPick = null">Cancel</button>
        <button class="btn btn-red" type="button" (click)="confirmDelete()">Delete</button>
      </ng-template>
    </ui-modal>

    @if (toast()) {
      <div class="toast"><ui-icon name="check" size="16" /> {{ toast() }}</div>
    }
  `,
  styles: [
    `
      .dt-bar {
        display: flex;
        gap: 12px;
        align-items: center;
        padding: 18px 20px;
        margin-bottom: 24px;
        flex-wrap: wrap;
      }
      .dt-input { flex: 1; min-width: 240px; height: 42px; }
      .dt-bar .btn { height: 42px; }
      .dt-error {
        margin: -14px 0 18px;
        font-size: 13px;
        color: #b4483e;
        background: #fdeeee;
        border: 1px solid #f2cfcf;
        border-radius: 9px;
        padding: 9px 14px;
        display: inline-block;
      }
      .rec-count { color: #6b7280; font-size: 13.5px; }
      .in-use { color: #98a0aa; font-size: 13.5px; }
      .del-text { font-size: 14.5px; color: #3f4954; line-height: 1.6; }
    `,
  ],
})
export class DocTypes {
  private dts = inject(DocTypesService);

  newName = '';
  error = '';
  delPick: { id: number; name: string } | null = null;

  toast = signal<string | null>(null);
  private toastTimer: ReturnType<typeof setTimeout> | undefined;

  types() {
    return this.dts.list();
  }

  countFor(name: string): number {
    return this.dts.countFor(name);
  }

  add(): void {
    this.error = '';
    const err = this.dts.add(this.newName);
    if (err) {
      this.error = err;
      return;
    }
    this.newName = '';
    this.showToast('Document type added.');
  }

  pickDelete(t: { id: number; name: string }): void {
    this.delPick = t;
  }

  confirmDelete(): void {
    if (!this.delPick) return;
    const ok = this.dts.removeIfUnused(this.delPick.id);
    this.delPick = null;
    this.showToast(ok ? 'Document type deleted.' : 'Cannot delete a type that is in use.');
  }

  private showToast(msg: string): void {
    this.toast.set(msg);
    clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => this.toast.set(null), 2400);
  }
}
