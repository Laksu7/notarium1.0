import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../core/auth';
import { RecordsService } from '../../core/records';
import { DocTypesService } from '../../core/doctypes';
import {
  FORM_STATUSES,
  LOCATIONS,
  NotarizationRecord,
  RecordStatus,
  STATUSES,
  fmtDate,
  locationFor,
} from '../../core/models';
import { UiIcon } from '../../shared/icon';
import { UiModal } from '../../shared/modal';

interface RecordForm {
  id: number | null;
  documentNo: string;
  type: string;
  clientName: string;
  dateNotarized: string;
  status: RecordStatus;
  location: string;
}

@Component({
  selector: 'app-records',
  imports: [FormsModule, UiIcon, UiModal],
  template: `
    <div class="pg">
      <header class="page-head no-print">
        <h1>Notarization Records</h1>
        <p>All notarized documents recorded by the office, kept organized and traceable.</p>
      </header>

      <div class="toolbar no-print">
        <div class="rc-search">
          <ui-icon name="search" size="16" />
          <input
            name="recSearch"
            placeholder="Search document number, client, or type"
            [ngModel]="search"
            (ngModelChange)="search = $event; page = 1"
          />
        </div>

        <button class="btn btn-light" type="button" (click)="openFilter()">
          <ui-icon name="filter" size="15" /> Filter
          @if (fApplied) { <span class="filter-dot"></span> }
        </button>

        <button class="btn btn-green add-btn" type="button" (click)="openAdd()">
          <ui-icon name="plus" size="16" /> Add Record
        </button>
      </div>

      <section class="panel">
        @if (selected.length > 0) {
          <div class="bulk-bar">
            <span class="bulk-count">{{ selected.length }} selected</span>
            <select class="field bulk-status" name="bulkStatus" [ngModel]="bulkStatus" (ngModelChange)="bulkStatus = $event">
              <option value="" disabled>Bulk update status…</option>
              @for (s of formStatuses; track s) {
                <option [value]="s">{{ s }}</option>
              }
            </select>
            <button class="btn btn-green" type="button" [disabled]="!bulkStatus" (click)="applyBulk()">
              <ui-icon name="edit" size="15" /> Update Selected Records
            </button>
            <button class="btn btn-light" type="button" (click)="clearSelection()">Clear</button>
          </div>
        }

        <div class="table-wrap">
          <table class="table">
            <thead>
              <tr>
                <th class="th-doc" title="Select all displayed records">
                  <div class="doc-wrap head">
                    <input
                      type="checkbox"
                      name="selAllPage"
                      [ngModel]="allPageSelected"
                      [indeterminate]="somePageSelected && !allPageSelected"
                      (ngModelChange)="toggleAllPage($event)"
                      [disabled]="pagedRows.length === 0"
                    />
                    <span>Doc No.</span>
                  </div>
                </th>
                <th>Type</th>
                <th title="Client Name">Client</th>
                <th title="Date Notarized">Date</th>
                <th>Status</th>
                <th>Location</th>
                <th class="th-actions">Actions</th>
              </tr>
            </thead>
            <tbody>
              @for (r of pagedRows; track r.id) {
                <tr [class.picked-row]="selected.includes(r.id)">
                  <td class="td-doc">
                    <div class="doc-wrap">
                      <input
                        type="checkbox"
                        [attr.name]="'ck' + r.id"
                        title="Select this record"
                        [ngModel]="selected.includes(r.id)"
                        (ngModelChange)="toggleRow($event, r.id)"
                      />
                      <b class="doc-no" [title]="r.clientName">{{ r.documentNo }}</b>
                    </div>
                  </td>
                  <td>{{ r.type }}</td>
                  <td>{{ r.clientName }}</td>
                  <td>{{ fmt(r.dateNotarized) }}</td>
                  <td class="td-status">
                    <select
                      class="field row-field"
                      [attr.name]="'rowStatus' + r.id"
                      [ngModel]="r.status"
                      (ngModelChange)="setStatus(r, $event)"
                    >
                      @for (s of rowStatuses(r); track s) {
                        <option [value]="s">{{ s }}</option>
                      }
                    </select>
                  </td>
                  <td class="td-loc">
                    @if (locationLocked(r)) {
                      <input
                        class="field row-field field-locked"
                        [attr.name]="'rowLocLock' + r.id"
                        [value]="r.location"
                        disabled
                        [title]="'Assigned automatically: ' + r.status"
                      />
                    } @else {
                      <select
                        class="field row-field"
                        [attr.name]="'rowLoc' + r.id"
                        [ngModel]="r.location"
                        (ngModelChange)="setLocation(r, $event)"
                      >
                        @for (l of locations; track l) {
                          <option [value]="l">{{ l }}</option>
                        }
                      </select>
                    }
                  </td>
                  <td class="td-actions">
                    <div class="acts">
                      <button class="icon-btn" title="View" type="button" (click)="openView(r)">
                        <ui-icon name="eye" size="16" />
                      </button>
                      <button class="icon-btn" title="Edit" type="button" (click)="openEdit(r)">
                        <ui-icon name="edit" size="15" />
                      </button>
                      <button class="icon-btn danger" title="Delete" type="button" (click)="openDelete(r)">
                        <ui-icon name="trash" size="15" />
                      </button>
                    </div>
                  </td>
                </tr>
              } @empty {
                <tr><td colspan="7" class="empty">No notarization records found.</td></tr>
              }
            </tbody>
          </table>
        </div>

        <div class="table-foot">
          <span>{{ countText }}</span>
          <div class="pager">
            <button type="button" [disabled]="clampedPage <= 1" (click)="go(clampedPage - 1)" aria-label="Previous page">
              <ui-icon name="chev-left" size="15" />
            </button>
            @for (p of pageCountList; track p) {
              <button type="button" [class.on]="p === clampedPage" (click)="go(p)">{{ p }}</button>
            }
            <button type="button" [disabled]="clampedPage >= pageCount" (click)="go(clampedPage + 1)" aria-label="Next page">
              <ui-icon name="chev-right" size="15" />
            </button>
          </div>
        </div>
      </section>
    </div>

    <!-- add / edit -->
    <ui-modal [open]="formOpen" [title]="form.id ? 'Edit Record' : 'New Notarization Record'" width="560px" (close)="closeForm()">
      <div class="form-grid">
        <div class="fg">
          <label class="lbl">Document No.<span class="lbl-req">*</span></label>
          <input
            class="field"
            name="fdoc"
            placeholder="e.g. 2026-0001 or N-042"
            [ngModel]="form.documentNo"
            (ngModelChange)="form.documentNo = $event"
            [class.invalid]="submitted && !form.documentNo.trim()"
          />
        </div>

        <div class="fg">
          <label class="lbl">Document Type<span class="lbl-req">*</span></label>
          <select class="field" name="ftype" [ngModel]="form.type" (ngModelChange)="form.type = $event" [class.invalid]="submitted && !form.type">
            <option value="" disabled>Select document type…</option>
            @for (t of typeNames; track t) {
              <option [value]="t">{{ t }}</option>
            }
          </select>
        </div>

        <div class="fg">
          <label class="lbl">Client Name<span class="lbl-req">*</span></label>
          <input
            class="field"
            name="fclient"
            placeholder="Full name of the client"
            [ngModel]="form.clientName"
            (ngModelChange)="form.clientName = $event"
            [class.invalid]="submitted && !form.clientName.trim()"
          />
        </div>

        <div class="fg">
          <label class="lbl">Date Notarized<span class="lbl-req">*</span></label>
          <input
            class="field"
            type="date"
            name="fdate"
            [ngModel]="form.dateNotarized"
            (ngModelChange)="form.dateNotarized = $event"
            [class.invalid]="submitted && !form.dateNotarized"
          />
        </div>

        <div class="fg-pair">
          <div class="fg">
            <label class="lbl">Status</label>
            <select
              class="field"
              name="fstatus"
              [ngModel]="form.status"
              (ngModelChange)="form.status = $event; form.location = locationFor(form.status)"
            >
              @for (s of formStatuses; track s) {
                <option [value]="s">{{ s }}</option>
              }
            </select>
          </div>
          <div class="fg">
            <label class="lbl">Location</label>
            <input class="field field-locked" name="floc" [value]="form.location" disabled [title]="'Assigned automatically: ' + form.status" />
          </div>
        </div>

        @if (submitted && !formValid) {
          <div class="form-error">Please fill in all required fields.</div>
        }
      </div>

      <ng-template #foot>
        <button class="btn btn-light" type="button" (click)="closeForm()">Cancel</button>
        <button class="btn btn-green" type="button" (click)="saveForm()">{{ form.id ? 'Save Changes' : 'Add Record' }}</button>
      </ng-template>
    </ui-modal>

    <!-- view -->
    <ui-modal [open]="viewRec !== null" title="Record Details" width="560px" (close)="viewRec = null">
      @if (viewRec; as vr) {
        <div class="rd-grid">
          <div class="rd-row"><span>Document No.</span><b class="doc-no">{{ vr.documentNo }}</b></div>
          <div class="rd-row"><span>Type</span><b>{{ vr.type }}</b></div>
          <div class="rd-row"><span>Client Name</span><b>{{ vr.clientName }}</b></div>
          <div class="rd-row"><span>Date Notarized</span><b>{{ fmt(vr.dateNotarized) }}</b></div>
          <div class="rd-row"><span>Status</span><b>{{ vr.status }}</b></div>
          <div class="rd-row"><span>Location</span><b>{{ vr.location }}</b></div>
        </div>
      }
      <ng-template #foot>
        <button class="btn btn-light" type="button" (click)="viewRec = null">Close</button>
        @if (viewRec) {
          <button class="btn btn-green" type="button" (click)="openEdit(viewRec); viewRec = null">Edit Record</button>
        }
      </ng-template>
    </ui-modal>

    <!-- filter -->
    <ui-modal [open]="filterOpen" title="Filter Records" width="460px" (close)="filterOpen = false">
      <div class="form-grid">
        <div class="fg">
          <label class="lbl">Document Type</label>
          <select class="field" name="fltType" [ngModel]="fTypeDraft" (ngModelChange)="fTypeDraft = $event">
            <option value="">All document types</option>
            @for (t of typeNames; track t) {
              <option [value]="t">{{ t }}</option>
            }
          </select>
        </div>
        <div class="fg">
          <label class="lbl">Status</label>
          <select class="field" name="fltStatus" [ngModel]="fStatusDraft" (ngModelChange)="fStatusDraft = $event">
            <option value="">All statuses</option>
            @for (s of statuses; track s) {
              <option [value]="s">{{ s }}</option>
            }
          </select>
        </div>
      </div>
      <ng-template #foot>
        <button class="btn btn-light" type="button" (click)="clearFilter()">Clear</button>
        <button class="btn btn-green" type="button" (click)="applyFilter()">Apply Filters</button>
      </ng-template>
    </ui-modal>

    <!-- delete confirm -->
    <ui-modal [open]="delRec !== null" title="Delete Record" width="440px" (close)="delRec = null">
      <p class="del-text">
        Delete record <b class="doc-no">{{ delRec?.documentNo }}</b> for client
        <b>{{ delRec?.clientName }}</b>? This action cannot be undone.
      </p>
      <ng-template #foot>
        <button class="btn btn-light" type="button" (click)="delRec = null">Cancel</button>
        <button class="btn btn-red" type="button" (click)="confirmDelete()">Delete</button>
      </ng-template>
    </ui-modal>

    @if (toast()) {
      <div class="toast"><ui-icon name="check" size="16" /> {{ toast() }}</div>
    }
  `,
  styles: [
    `
      .toolbar { display: flex; align-items: center; gap: 12px; margin: 0 0 22px; flex-wrap: wrap; }
      .rc-search {
        display: flex;
        align-items: center;
        gap: 9px;
        border: 1px solid #ddd8ca;
        border-radius: 10px;
        padding: 0 12px;
        height: 42px;
        width: 330px;
        max-width: 100%;
        background: #fff;
        transition: border-color 0.15s, box-shadow 0.15s;
      }
      .rc-search:focus-within { border-color: var(--gold); box-shadow: 0 0 0 3px rgba(201, 165, 68, 0.14); }
      .rc-search .app-icon { color: #97a0ac; }
      .rc-search input { flex: 1; min-width: 0; border: 0; outline: 0; background: transparent; font-family: inherit; font-size: 13.5px; color: var(--ink); }
      .rc-search input::placeholder { color: #9aa3b0; }
      .toolbar .btn { height: 42px; }
      .add-btn { margin-left: auto; }

      .filter-dot {
        position: absolute;
        top: -3px;
        right: -4px;
        width: 9px;
        height: 9px;
        border-radius: 50%;
        background: var(--gold);
        border: 2px solid #f4f1e9;
      }
      .toolbar .btn { position: relative; }

      /* compact table so checkbox → action columns all fit on screen */
      .table th { padding: 11px 6px; font-size: 10.5px; letter-spacing: 0.06em; }
      .table td { padding: 10px 6px; font-size: 13px; }
      .table td .doc-no { font-size: 13px; }

      .acts { display: inline-flex; gap: 4px; }
      .acts .icon-btn { width: 26px; height: 26px; }

      /* checkbox is part of the Doc No. column */
      .doc-wrap { display: flex; align-items: center; gap: 7px; }
      .doc-wrap input[type='checkbox'] {
        width: 15px;
        height: 15px;
        accent-color: var(--navy);
        cursor: pointer;
        flex: 0 0 auto;
      }
      .picked-row td { background: #fbf8ee; }

      /* inline Status / Location controls — fixed width so text never clips */
      td .row-field {
        width: 118px;
        min-width: 118px;
        height: 36px;
        font-size: 12.5px;
        padding: 5px 8px;
      }
      td select.row-field { padding-right: 22px; }

      /* very narrow windows: fold the Type column away (still in View/Edit/search) */
      @media (max-width: 1020px) {
        .table th:nth-of-type(2),
        .table td:nth-of-type(2) { display: none; }
      }

      /* bulk bar shown above the table when records are selected */
      .bulk-bar {
        display: flex;
        align-items: center;
        gap: 12px;
        flex-wrap: wrap;
        background: #fbf8ee;
        border: 1px solid #eee7d2;
        border-radius: 10px;
        padding: 10px 12px;
        margin: 0 12px 16px;
      }
      .bulk-count { font-size: 12.5px; font-weight: 600; color: #6b7280; min-width: 78px; }
      .bulk-status { width: 220px; }
      .bulk-bar .field { padding: 8px 10px; font-size: 13px; height: 38px; }

      /* form */
      .form-grid { display: grid; gap: 16px; }
      .fg-pair { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
      .field-locked { background: #f4f1e9; color: #5a6470; cursor: not-allowed; }
      .form-error {
        font-size: 13px;
        color: var(--red);
        background: #fdeeee;
        border: 1px solid #f2cfcf;
        border-radius: 9px;
        padding: 9px 12px;
      }

      .rd-grid { display: grid; grid-template-columns: 1fr; }
      .rd-row {
        display: flex;
        justify-content: space-between;
        gap: 14px;
        padding: 12px 2px;
        border-bottom: 1px solid #f0ede3;
        font-size: 14px;
      }
      .rd-row:last-child { border-bottom: 0; }
      .rd-row span { color: #7c848e; }
      .rd-row b { color: #263444; font-weight: 600; text-align: right; }
      .rd-row .doc-no { color: var(--navy); font-weight: 700; }

      .del-text { font-size: 14.5px; color: #3f4954; line-height: 1.6; }

      @media (max-width: 720px) {
        .fg-pair { grid-template-columns: 1fr; }
      }
    `,
  ],
})
export class Records implements OnInit {
  rec = inject(RecordsService);
  private dts = inject(DocTypesService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  auth = inject(AuthService);

  /** All statuses — kept for the filter so legacy "In Office" records stay visible. */
  statuses = STATUSES;
  /** Only the two statuses allowed on record forms and bulk updates. */
  formStatuses = FORM_STATUSES;
  locations = LOCATIONS;
  typeNames = this.dts.names();

  search = '';
  page = 1;
  pageSize = 8;

  fApplied = false;
  fType = '';
  fStatus = '';
  fTypeDraft = '';
  fStatusDraft = '';

  filterOpen = false;
  viewRec: NotarizationRecord | null = null;
  delRec: NotarizationRecord | null = null;

  formOpen = false;
  submitted = false;
  form: RecordForm = this.emptyForm();

  /** selection ids + chosen bulk status, feeding the bulk bar above the table */
  selected: number[] = [];
  bulkStatus: RecordStatus | '' = '';

  toast = signal<string | null>(null);
  private toastTimer: ReturnType<typeof setTimeout> | undefined;

  ngOnInit(): void {
    const params = this.route.snapshot.queryParamMap;
    if (params.get('new') === '1') {
      this.openAdd();
    } else if (params.get('edit')) {
      const id = Number(params.get('edit'));
      const r = this.rec.byId(id);
      if (r) this.openEdit(r);
    }
    // clear url params so refresh doesn't re-open
    if (params.get('new') || params.get('edit')) {
      this.router.navigate([], { relativeTo: this.route, queryParams: {}, replaceUrl: true });
    }
  }

  emptyForm(): RecordForm {
    const today = new Date();
    const iso = today.getFullYear() + '-' + String(today.getMonth() + 1).padStart(2, '0') + '-' + String(today.getDate()).padStart(2, '0');
    return {
      id: null,
      documentNo: '',
      type: '',
      clientName: '',
      dateNotarized: iso,
      status: 'For Submission',
      location: locationFor('For Submission'), // → Pasalan Law Office
    };
  }

  locationFor(status: string, current = ''): string {
    return locationFor(status as RecordStatus, current);
  }

  get formValid(): boolean {
    return !!(this.form.documentNo.trim() && this.form.type && this.form.clientName.trim() && this.form.dateNotarized);
  }

  fmt(iso: string): string {
    return fmtDate(iso);
  }

  filteredRows(): NotarizationRecord[] {
    const q = this.search.trim().toLowerCase();
    return this.rec.list().filter((r) => {
      const text = (r.documentNo + ' ' + r.clientName + ' ' + r.type).toLowerCase();
      const okText = !q || text.includes(q);
      const okType = !this.fType || r.type === this.fType;
      const okStatus = !this.fStatus || r.status === this.fStatus;
      return okText && okType && okStatus;
    });
  }

  get pagedRows(): NotarizationRecord[] {
    const rows = this.filteredRows();
    const pc = this.pageCount;
    const p = Math.min(Math.max(1, this.page), pc);
    return rows.slice((p - 1) * this.pageSize, p * this.pageSize);
  }

  get pageCount(): number {
    return Math.max(1, Math.ceil(this.filteredRows().length / this.pageSize));
  }

  get pageCountList(): number[] {
    return Array.from({ length: this.pageCount }, (_, i) => i + 1);
  }

  get clampedPage(): number {
    return Math.min(Math.max(1, this.page), this.pageCount);
  }

  get countText(): string {
    const rows = this.filteredRows();
    const total = rows.length;
    if (total === 0) return 'Showing 0–0 of 0 records';
    const start = (this.clampedPage - 1) * this.pageSize + 1;
    const end = Math.min(this.clampedPage * this.pageSize, total);
    return `Showing ${start}–${end} of ${total} records`;
  }

  go(p: number): void {
    this.page = Math.min(Math.max(1, p), this.pageCount);
  }

  // ----- modals -----
  openAdd(): void {
    this.form = this.emptyForm();
    this.submitted = false;
    this.formOpen = true;
  }

  openEdit(r: NotarizationRecord): void {
    this.form = { ...r };
    this.submitted = false;
    this.formOpen = true;
  }

  closeForm(): void {
    this.formOpen = false;
  }

  saveForm(): void {
    this.submitted = true;
    if (!this.formValid) return;
    const { id, ...rest } = this.form;
    // location is always a consequence of status — enforce the mapping here too
    rest.location = locationFor(rest.status, rest.location);
    if (id) {
      this.rec.update(id, rest);
      this.showToast('Record updated.');
    } else {
      this.rec.add(rest);
      this.page = 1;
      this.showToast('New record added.');
    }
    this.formOpen = false;
  }

  openView(r: NotarizationRecord): void {
    this.viewRec = r;
  }

  openFilter(): void {
    this.fTypeDraft = this.fType;
    this.fStatusDraft = this.fStatus;
    this.filterOpen = true;
  }

  applyFilter(): void {
    this.fType = this.fTypeDraft;
    this.fStatus = this.fStatusDraft;
    this.fApplied = !!(this.fType || this.fStatus);
    this.page = 1;
    this.filterOpen = false;
  }

  clearFilter(): void {
    this.fTypeDraft = '';
    this.fStatusDraft = '';
    this.fType = '';
    this.fStatus = '';
    this.fApplied = false;
    this.page = 1;
    this.filterOpen = false;
  }

  // ----- selection & bulk update (Document Status & Location management) -----
  get allPageSelected(): boolean {
    const rows = this.pagedRows;
    return rows.length > 0 && rows.every((r) => this.selected.includes(r.id));
  }

  get somePageSelected(): boolean {
    const rows = this.pagedRows;
    return rows.length > 0 && rows.some((r) => this.selected.includes(r.id)) && !this.allPageSelected;
  }

  toggleRow(checked: boolean, id: number): void {
    this.selected = checked ? [...this.selected, id] : this.selected.filter((x) => x !== id);
  }

  /** Select-all applies to the records currently displayed on this page. */
  toggleAllPage(checked: boolean): void {
    const ids = this.pagedRows.map((r) => r.id);
    this.selected = checked ? [...new Set([...this.selected, ...ids])] : this.selected.filter((id) => !ids.includes(id));
  }

  clearSelection(): void {
    this.selected = [];
    this.bulkStatus = '';
  }

  /** Status choices for a row: legacy rows keep their current value selectable. */
  rowStatuses(r: NotarizationRecord): RecordStatus[] {
    return r.status === 'In Office' ? ['In Office', ...this.formStatuses] : this.formStatuses;
  }

  /** Location follows status for the two main statuses. */
  locationLocked(r: NotarizationRecord): boolean {
    return FORM_STATUSES.includes(r.status);
  }

  /** One-row status change — location is re-assigned automatically. */
  setStatus(r: NotarizationRecord, v: RecordStatus): void {
    this.rec.update(r.id, { status: v, location: locationFor(v, r.location) });
    this.showToast(`Status updated — moved to ${locationFor(v, r.location)}.`);
  }

  setLocation(r: NotarizationRecord, v: string): void {
    this.rec.update(r.id, { location: v });
    this.showToast('Location updated.');
  }

  /** Bulk-update every selected record at once (location follows the status). */
  applyBulk(): void {
    if (this.selected.length === 0) {
      this.showToast('Select at least one record first.', true);
      return;
    }
    if (!this.bulkStatus) {
      this.showToast('Choose the new status for the bulk update.', true);
      return;
    }
    const ids = [...this.selected];
    this.rec.bulkUpdate(ids, { status: this.bulkStatus });
    this.showToast(`${ids.length} record${ids.length === 1 ? '' : 's'} updated — moved to ${locationFor(this.bulkStatus)}.`);
    this.clearSelection();
  }

  openDelete(r: NotarizationRecord): void {
    this.delRec = r;
  }

  confirmDelete(): void {
    if (!this.delRec) return;
    this.rec.remove(this.delRec.id);
    this.selected = this.selected.filter((id) => id !== this.delRec!.id);
    this.delRec = null;
    this.showToast('Record deleted.');
    if (this.clampedPage > this.pageCount) this.page = this.pageCount;
  }

  private showToast(msg: string, isError = false): void {
    this.toast.set(isError ? '⚠ ' + msg : msg);
    clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => this.toast.set(null), 2600);
  }
}
