import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs';
import { AuthService } from '../../core/auth';
import { RecordsService } from '../../core/records';
import { DocTypesService } from '../../core/doctypes';
import { NotarizationRecord, STATUSES, fmtDate, monthYearLabel, FORM_STATUSES, LOCATIONS, RecordStatus, locationFor } from '../../core/models';
import { UiIcon } from '../../shared/icon';
import { UiModal } from '../../shared/modal';

@Component({
  selector: 'app-dashboard',
  imports: [RouterLink, UiIcon, UiModal, FormsModule],
  template: `
    <div class="dash">
      <div class="dash-main">
        <header class="page-head">
          <h1>Good {{ greeting() }}, {{ firstName }}!</h1>
          <p>Here's your notarization record overview.</p>
        </header>

        <section class="stats">
          <article class="stat is-total">
            <span class="stat-label">Total Records</span>
            <div class="stat-num">{{ vit().total }}</div>
            <div class="stat-sub">This month</div>
          </article>

          <article class="stat">
            <span class="stat-label">This Month</span>
            <div class="stat-num">{{ vit().thisMonth }}</div>
            <div class="stat-sub">{{ monthYear() }}</div>
          </article>

          <article class="stat">
            <span class="stat-label">For Submission</span>
            <div class="stat-num">{{ vit().forSubmission }}</div>
            <div class="stat-sub">Pending submission</div>
          </article>

          <article class="stat">
            <span class="stat-label">Submitted</span>
            <div class="stat-num">{{ vit().submitted }}</div>
            <div class="stat-sub">To central records</div>
          </article>
        </section>

        <section class="panel recent">
          <div class="recent-head">
            <h2 class="panel-title">Recent Notarization Records</h2>
            <a
              class="btn btn-green"
              [routerLink]="['/records']"
              [queryParams]="{ new: 1 }"
            >
              <ui-icon name="plus" size="15" /> New Notarization Record
            </a>
          </div>

          <div class="table-wrap">
            <table class="table">
              <thead>
                <tr>
                  <th>Document No.</th>
                  <th>Type</th>
                  <th>Client Name</th>
                  <th>Date Notarized</th>
                  <th>Status</th>
                  <th>Location</th>
                  <th class="th-actions">Actions</th>
                </tr>
              </thead>
              <tbody>
                @for (r of pagedRows; track r.id) {
                  <tr>
                    <td class="doc-no">{{ r.documentNo }}</td>
                    <td>{{ r.type }}</td>
                    <td>{{ r.clientName }}</td>
                    <td>{{ fmt(r.dateNotarized) }}</td>
                    <td class="d-status">
                      <select
                        class="field row-field"
                        [attr.name]="'dashStatus' + r.id"
                        [ngModel]="r.status"
                        (ngModelChange)="setStatus(r, $event)"
                      >
                        @for (s of rowStatuses(r); track s) {
                          <option [value]="s">{{ s }}</option>
                        }
                      </select>
                    </td>
                    <td class="d-loc">
                      @if (locationLocked(r)) {
                        <input
                          class="field row-field field-locked"
                          [attr.name]="'dashLocL' + r.id"
                          [value]="r.location"
                          disabled
                          [title]="'Assigned automatically: ' + r.status"
                        />
                      } @else {
                        <select
                          class="field row-field"
                          [attr.name]="'dashLoc' + r.id"
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
                        <a
                          class="icon-btn"
                          title="Edit"
                          [routerLink]="['/records']"
                          [queryParams]="{ edit: r.id }"
                        >
                          <ui-icon name="edit" size="15" />
                        </a>
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

      <aside class="dash-side">
        <section class="panel side-card">
          <h3 class="panel-title sm">Quick Search &amp; Filters</h3>

          <label class="f-label">Search</label>
          <div class="f-search">
            <ui-icon name="search" size="16" />
            <input
              name="dashSearch"
              placeholder="Search document no., client, or keyword"
              (ngModelChange)="apply(true)"
              [ngModel]="searchTerm"
              (keydown.enter)="apply(true)"
            />
          </div>

          <label class="f-label">Document Type</label>
          <select class="field" name="dashType" [ngModel]="fType" (ngModelChange)="fType = $event; apply(true)">
            <option value="">All document types</option>
            @for (t of typeNames; track t) {
              <option [value]="t">{{ t }}</option>
            }
          </select>

          <label class="f-label">Status</label>
          <select class="field" name="dashStatus" [ngModel]="fStatus" (ngModelChange)="fStatus = $event; apply(true)">
            <option value="">All statuses</option>
            @for (s of statuses; track s) {
              <option [value]="s">{{ s }}</option>
            }
          </select>

          <label class="f-label">Date Range</label>
          <div class="f-dates">
            <input class="field" type="date" name="dashFrom" [ngModel]="fFrom" (ngModelChange)="fFrom = $event" />
            <input class="field" type="date" name="dashTo" [ngModel]="fTo" (ngModelChange)="fTo = $event" />
          </div>

          <div class="f-actions">
            <button class="btn btn-green f-grow" type="button" (click)="apply(false)">Search</button>
            <button class="btn btn-light f-grow" type="button" (click)="clear()">Clear</button>
          </div>
        </section>

        <section class="panel side-card">
          <div class="tm-head">
            <h3 class="panel-title sm">This Month</h3>
            <span class="tm-date">{{ monthYear() }}</span>
          </div>
          @for (row of monthRows; track row.type) {
            <div class="tm-row"><span>{{ row.type }}</span><b>{{ row.count }}</b></div>
          }
          @empty {
            <div class="tm-row muted-row"><span>No notarized documents yet this month.</span></div>
          }
          <div class="tm-total"><span>Total</span><b>{{ monthTotal }}</b></div>
        </section>

        <section class="promo">
          <h3>Organized Records<br />for a Smoother<br />Legal Process.</h3>
          <div class="promo-rule"></div>
          <svg class="promo-feather" viewBox="0 0 24 24" fill="none" stroke="rgba(190,205,226,0.35)" stroke-width="1" stroke-linecap="round" stroke-linejoin="round">
            <path d="M20.24 12.24a6 6 0 0 0-8.49-8.49L5 10.5V19h8.5z" />
            <path d="M16 8L2 22" />
            <path d="M17.5 15H9" />
          </svg>
        </section>
      </aside>
    </div>

    <!-- view modal -->
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
          <a class="btn btn-green" [routerLink]="['/records']" [queryParams]="{ edit: viewRec.id }" (click)="viewRec = null">
            Edit Record
          </a>
        }
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
      .dash { display: grid; grid-template-columns: minmax(0, 1fr) 400px; gap: 26px; align-items: start; }

      .stats { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 20px; margin-bottom: 26px; }
      @media (max-width: 1460px) {
        .dash { grid-template-columns: minmax(0, 1fr) 340px; }
      }
      @media (max-width: 1240px) {
        .stats { grid-template-columns: repeat(2, minmax(0, 1fr)); }
      }
      @media (max-width: 1320px) {
        .dash { grid-template-columns: 1fr; }
        aside.dash-side {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          align-items: start;
          gap: 22px;
        }
        .promo { min-height: 150px; }
      }
      .stat {
        background: #fff;
        border-radius: 14px;
        box-shadow: var(--shadow-card);
        padding: 20px 22px 18px;
      }
      .stat.is-total { border: 1.6px solid var(--navy-ink); box-shadow: 0 6px 22px -12px rgba(31, 58, 95, 0.35); }
      .stat-label {
        display: block;
        font-family: 'Playfair Display', Georgia, serif;
        font-size: 12.5px;
        font-weight: 700;
        letter-spacing: 0.1em;
        text-transform: uppercase;
        color: #3d4a5c;
      }
      .stat-num {
        font-family: 'Playfair Display', Georgia, serif;
        font-weight: 700;
        font-size: 40px;
        line-height: 1.05;
        color: var(--navy);
        margin: 12px 0 12px;
      }
      .stat-sub { font-size: 13px; color: #6b7280; }
      .stat-sub span { color: #4b5563; font-weight: 600; }

      .recent { overflow: hidden; }
      .recent-head {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 14px;
        flex-wrap: wrap;
        padding: 20px 20px 16px;
      }

      .acts { display: inline-flex; gap: 4px; }
      .acts .icon-btn { width: 26px; height: 26px; }

      /* compact recent table — same inline controls as the records page */
      .recent .table th { padding: 11px 6px; font-size: 10.5px; letter-spacing: 0.06em; }
      .recent .table td { padding: 10px 6px; font-size: 13px; }
      .recent .table td .doc-no { font-size: 13px; }
      .recent td .row-field {
        width: 118px;
        min-width: 118px;
        height: 36px;
        font-size: 12.5px;
        padding: 5px 8px;
      }
      .recent td select.row-field { padding-right: 22px; }
      .field-locked { background: #f4f1e9; color: #5a6470; cursor: not-allowed; }

      @media (min-width: 1321px) {
        aside.dash-side { display: flex; flex-direction: column; gap: 22px; min-width: 0; }
      }
      .side-card { padding: 20px 20px 22px; }

      .f-search {
        display: flex;
        align-items: center;
        gap: 9px;
        border: 1px solid #ddd8ca;
        border-radius: 10px;
        padding: 0 12px;
        height: 40px;
        background: #fff;
      }
      .f-search:focus-within { border-color: var(--gold); box-shadow: 0 0 0 3px rgba(201, 165, 68, 0.14); }
      .f-search .app-icon { color: #97a0ac; }
      .f-search input {
        flex: 1;
        min-width: 0;
        border: 0;
        outline: 0;
        background: transparent;
        font-family: inherit;
        font-size: 13.5px;
        color: var(--ink);
      }
      .f-search input::placeholder { color: #9aa3b0; }
      .f-dates { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
      .f-dates .field { padding: 8px 10px; font-size: 13px; }
      .f-actions { display: flex; gap: 10px; margin-top: 16px; }
      .f-grow { flex: 1; }

      .tm-head { display: flex; align-items: baseline; justify-content: space-between; gap: 10px; }
      .tm-date { font-size: 12.5px; color: #8a8f98; }
      .tm-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 11px 2px;
        border-bottom: 1px solid #f0ede3;
        font-size: 14px;
        color: #3f4954;
      }
      .tm-row b { color: var(--navy); font-weight: 700; }
      .muted-row { border-bottom: 0; color: #8a8f98; padding: 14px 2px; }
      .tm-total {
        margin-top: 8px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        background: #fbf3dd;
        border-radius: 10px;
        padding: 13px 16px;
        font-size: 14px;
        font-weight: 700;
        color: #31333a;
      }
      .tm-total b { color: var(--navy); font-size: 15px; }

      .promo {
        position: relative;
        overflow: hidden;
        border-radius: 14px;
        padding: 26px 24px 30px;
        background: linear-gradient(150deg, #24466f 0%, #1c3557 55%, #142a4c 100%);
        box-shadow: 0 16px 36px -18px rgba(20, 42, 76, 0.6);
      }
      .promo h3 {
        font-family: 'Playfair Display', Georgia, serif;
        font-weight: 700;
        font-size: 25px;
        line-height: 1.4;
        color: #f4efe2;
        position: relative;
        z-index: 1;
      }
      .promo-rule { width: 34px; border-bottom: 2.5px solid var(--gold-soft); margin-top: 18px; border-radius: 2px; position: relative; z-index: 1; }
      .promo-feather {
        position: absolute;
        right: -26px;
        bottom: -30px;
        width: 150px;
        height: 150px;
        transform: rotate(-10deg);
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
    `,
  ],
})
export class Dashboard {
  auth = inject(AuthService);
  private rec = inject(RecordsService);
  private dts = inject(DocTypesService);
  private router = inject(Router);

  statuses = STATUSES;
  typeNames = this.dts.names();

  /** Only the two statuses allowed on forms and row updates. */
  formStatuses = FORM_STATUSES;
  locations = LOCATIONS;

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
    const location = locationFor(v, r.location);
    this.rec.update(r.id, { status: v, location });
    this.showToast(`Status updated — moved to ${location}.`);
  }

  setLocation(r: NotarizationRecord, v: string): void {
    this.rec.update(r.id, { location: v });
    this.showToast('Location updated.');
  }

  // quick filters
  searchTerm = '';
  fType = '';
  fStatus = '';
  fFrom = '';
  fTo = '';
  filtersOn = false;

  page = 1;
  pageSize = 5;

  viewRec: NotarizationRecord | null = null;
  delRec: NotarizationRecord | null = null;

  toast = signal<string | null>(null);
  private toastTimer: ReturnType<typeof setTimeout> | undefined;

  constructor() {
    // make sure page numbering resets when navigating back here
    this.router.events.pipe(filter((e) => e instanceof NavigationEnd)).subscribe(() => {
      this.page = 1;
    });
  }

  get firstName(): string {
    return (this.auth.user?.name ?? '').trim().split(/\s+/)[0] ?? '';
  }

  greeting(): string {
    const h = new Date().getHours();
    if (h < 12) return 'morning';
    if (h < 18) return 'afternoon';
    return 'evening';
  }

  monthYear(): string {
    return monthYearLabel(new Date());
  }

  vit() {
    return this.rec.vitals();
  }

  fmt(iso: string): string {
    return fmtDate(iso);
  }

  filteredRows(): NotarizationRecord[] {
    const base = this.rec.list();
    if (!this.filtersOn) return base;
    const q = this.searchTerm.trim().toLowerCase();
    return base.filter((r) => {
      const text = (r.documentNo + ' ' + r.clientName + ' ' + r.type + ' ' + r.location).toLowerCase();
      const okText = !q || text.includes(q);
      const okType = !this.fType || r.type === this.fType;
      const okStatus = !this.fStatus || r.status === this.fStatus;
      const okFrom = !this.fFrom || r.dateNotarized >= this.fFrom;
      const okTo = !this.fTo || r.dateNotarized <= this.fTo;
      return okText && okType && okStatus && okFrom && okTo;
    });
  }

  apply(setPage: boolean): void {
    this.filtersOn = true;
    if (setPage) this.page = 1;
  }

  clear(): void {
    this.searchTerm = '';
    this.fType = '';
    this.fStatus = '';
    this.fFrom = '';
    this.fTo = '';
    this.filtersOn = false;
    this.page = 1;
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

  go(p: number): void {
    this.page = Math.min(Math.max(1, p), this.pageCount);
  }

  get countText(): string {
    const rows = this.filteredRows();
    const total = rows.length;
    if (total === 0) return 'Showing 0–0 of 0 records';
    const start = (this.clampedPage - 1) * this.pageSize + 1;
    const end = Math.min(this.clampedPage * this.pageSize, total);
    return `Showing ${start}–${end} of ${total} records`;
  }

  get monthRows(): { type: string; count: number }[] {
    const now = new Date();
    const rows = this.rec.byMonth(now.getFullYear(), now.getMonth());
    const map = new Map<string, number>();
    for (const r of rows) map.set(r.type, (map.get(r.type) ?? 0) + 1);
    return [...map.entries()].map(([type, count]) => ({ type, count })).sort((a, b) => a.type.localeCompare(b.type));
  }

  get monthTotal(): number {
    const now = new Date();
    return this.rec.byMonth(now.getFullYear(), now.getMonth()).length;
  }

  openView(r: NotarizationRecord): void {
    this.viewRec = r;
  }

  openDelete(r: NotarizationRecord): void {
    this.delRec = r;
  }

  confirmDelete(): void {
    if (!this.delRec) return;
    this.rec.remove(this.delRec.id);
    this.delRec = null;
    this.showToast('Record deleted.');
    if (this.clampedPage > this.pageCount) this.page = this.pageCount;
  }

  private showToast(msg: string): void {
    this.toast.set(msg);
    clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => this.toast.set(null), 2600);
  }
}
