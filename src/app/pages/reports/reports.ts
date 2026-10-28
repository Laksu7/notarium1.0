import { Component, ElementRef, inject, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/auth';
import { RecordsService } from '../../core/records';
import { DocTypesService } from '../../core/doctypes';
import { SettingsService } from '../../core/settings';
import { MONTH_NAMES, RecordStatus, STATUSES, fmtDate } from '../../core/models';
import { downloadCsv } from '../../shared/csv';
import { UiIcon } from '../../shared/icon';

export interface MonthlyReport {
  month: number;
  year: number;
  monthLabel: string;
  total: number;
  forSubmission: number;
  submitted: number;
  byType: { name: string; count: number }[];
  byStatus: { name: string; count: number }[];
  byDay: { day: number; count: number }[];
  maxDayCount: number;
  records: {
    id: number;
    documentNo: string;
    type: string;
    clientName: string;
    dateNotarized: string;
    status: RecordStatus;
    location: string;
  }[];
  generatedAt: string;
}

export function buildMonthlyReport(
  rows: {
    id: number;
    documentNo: string;
    type: string;
    clientName: string;
    dateNotarized: string;
    status: RecordStatus;
    location: string;
  }[],
  catalogTypes: string[],
  month: number,
  year: number,
): MonthlyReport {
  // breakdown per document type (only types actually used this month)
  const byType: { name: string; count: number }[] = [];
  for (const t of catalogTypes) {
    const count = rows.filter((r) => r.type === t).length;
    if (count > 0) byType.push({ name: t, count });
  }
  const extras = [...new Set(rows.map((r) => r.type).filter((n) => !catalogTypes.includes(n)))];
  for (const e of extras) byType.push({ name: e, count: rows.filter((r) => r.type === e).length });
  byType.sort((a, b) => a.name.localeCompare(b.name));

  // records per day
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const byDay: { day: number; count: number }[] = Array.from({ length: daysInMonth }, (_, i) => ({ day: i + 1, count: 0 }));
  for (const r of rows) {
    const d = Number((r.dateNotarized || '').split('-')[2]);
    const slot = byDay[d - 1];
    if (slot) slot.count++;
  }
  const maxDayCount = Math.max(1, ...byDay.map((d) => d.count));

  return {
    month,
    year,
    monthLabel: MONTH_NAMES[month] ?? '—',
    total: rows.length,
    forSubmission: rows.filter((r) => r.status !== 'Submitted').length,
    submitted: rows.filter((r) => r.status === 'Submitted').length,
    byType,
    byStatus: STATUSES.map((s) => ({ name: s, count: rows.filter((r) => r.status === s).length })),
    byDay,
    maxDayCount,
    records: rows,
    generatedAt: new Date().toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' }),
  };
}

@Component({
  selector: 'app-reports',
  imports: [FormsModule, UiIcon],
  template: `
    <div class="pg">
      <header class="page-head no-print">
        <h1>Monthly Report</h1>
        <p>Organize notarization records by month and prepare the monthly report in seconds.</p>
      </header>

      <section class="panel bar no-print">
        <div class="bar-selects">
          <div class="bs">
            <label class="lbl">Month</label>
            <select class="field" name="rptMonth" [(ngModel)]="month" (ngModelChange)="onPeriodChange()">
              @for (m of monthNames; track $index; let i = $index) {
                <option [value]="i">{{ m }}</option>
              }
            </select>
          </div>
          <div class="bs">
            <label class="lbl">Year</label>
            <select class="field" name="rptYear" [(ngModel)]="year" (ngModelChange)="onPeriodChange()">
              @for (y of yearOptions; track y) {
                <option [value]="y">{{ y }}</option>
              }
            </select>
          </div>
        </div>
        <div class="bar-actions">
          @if (stale) {
            <span class="stale-hint">Showing {{ report?.monthLabel }} {{ report?.year }} — press Generate to update.</span>
          }
          <button class="btn btn-green" type="button" (click)="generate(true)">
            <ui-icon name="chart" size="16" /> Generate Report
          </button>
        </div>
      </section>

      <section class="panel card" #reportCard>
        @if (!report) {
          <div class="empty">
            <b>Generate a report to see the monthly summary</b>
            <p>Choose a month and year above, then press &ldquo;Generate Report&rdquo;.</p>
          </div>
        } @else if (report.total === 0) {
          <div class="empty">
            <b>No records for {{ report.monthLabel }} {{ report.year }}</b>
            <p>There are no notarization records in this period — pick another month and press Generate.</p>
          </div>
        } @else {
          <div class="report">
            <header class="rpt-head">
              <div>
                <div class="rpt-office">{{ settings.settings.name || 'Pasalan Law Office' }}</div>
                <div class="rpt-contact">{{ settings.settings.address }} &nbsp;·&nbsp; {{ settings.settings.contact }}</div>
              </div>
              <div class="rpt-right">
                <div class="rpt-kind">Monthly Notarization Report</div>
                <div class="rpt-period">{{ report.monthLabel }} {{ report.year }}</div>
              </div>
            </header>

            <div class="rpt-summary">
              <div class="rpt-big"><span>Total Documents</span><b>{{ report.total }}</b></div>
              <div class="rpt-big"><span>For Submission</span><b>{{ report.forSubmission }}</b></div>
              <div class="rpt-big"><span>Submitted to Central Records</span><b>{{ report.submitted }}</b></div>
            </div>

            <div class="rpt-grid">
              <div class="rpt-block">
                <h4>Documents by Type</h4>
                <table class="table mini">
                  <tbody>
                    @for (t of report.byType; track t.name) {
                      <tr><td>{{ t.name }}</td><td class="num">{{ t.count }}</td></tr>
                    } @empty {
                      <tr><td class="muted">No records this month.</td></tr>
                    }
                    <tr><td class="total-row">Total</td><td class="num total-row">{{ report.total }}</td></tr>
                  </tbody>
                </table>
              </div>

              <div class="rpt-block">
                <h4>Status Summary</h4>
                <table class="table mini">
                  <tbody>
                    @for (s of report.byStatus; track s.name) {
                      <tr><td>{{ s.name }}</td><td class="num">{{ s.count }}</td></tr>
                    }
                  </tbody>
                </table>
              </div>
            </div>

            <h4 class="rpt-records-title">Records per Day — {{ report.monthLabel }} {{ report.year }}</h4>
            <div class="day-chart" role="img" [attr.aria-label]="'Records per day chart for ' + report.monthLabel + ' ' + report.year">
              @for (d of report.byDay; track d.day) {
                <div class="daybar" [title]="dayTitle(d)">
                  <div class="daycol" [style.height.%]="d.count === 0 ? 0 : (d.count / report.maxDayCount) * 100"></div>
                  <span class="daynum">{{ d.day }}</span>
                </div>
              }
            </div>
            <p class="day-caption">Bar height = number of documents notarized that day (peak: {{ report.maxDayCount }}).</p>

            <h4 class="rpt-records-title">Records for {{ report.monthLabel }} {{ report.year }}</h4>
            <div class="table-wrap">
              <table class="table rows">
                <thead>
                  <tr>
                    <th>Document No.</th>
                    <th>Type</th>
                    <th>Client Name</th>
                    <th>Date Notarized</th>
                    <th>Status</th>
                    <th>Location</th>
                  </tr>
                </thead>
                <tbody>
                  @for (r of report.records; track r.id) {
                    <tr>
                      <td class="doc-no">{{ r.documentNo }}</td>
                      <td>{{ r.type }}</td>
                      <td>{{ r.clientName }}</td>
                      <td>{{ fmt(r.dateNotarized) }}</td>
                      <td>{{ r.status }}</td>
                      <td>{{ r.location }}</td>
                    </tr>
                  } @empty {
                    <tr><td colspan="6" class="empty-cell">No notarized documents for this month.</td></tr>
                  }
                </tbody>
              </table>
            </div>

            <div class="rpt-foot no-print">
              <span>Generated on {{ report.generatedAt }} by {{ auth.user?.name }}</span>
              <div class="rpt-btns">
                <button class="btn btn-light" type="button" (click)="exportExcel()">
                  <ui-icon name="grid" size="16" /> Excel (CSV)
                </button>
                <button class="btn btn-navy" type="button" (click)="exportPdf()">
                  <ui-icon name="print" size="16" /> Export PDF
                </button>
              </div>
            </div>
          </div>
        }
      </section>
    </div>
  `,
  styles: [
    `
      .bar {
        display: flex;
        align-items: flex-end;
        justify-content: space-between;
        gap: 18px;
        flex-wrap: wrap;
        padding: 20px 22px;
        margin-bottom: 24px;
      }
      .bar-selects { display: flex; gap: 16px; }
      .bs { width: 170px; }
      .bar-actions { display: flex; align-items: center; gap: 14px; flex-wrap: wrap; }
      .stale-hint { font-size: 12.5px; color: #8a6d1f; background: #fdf3d8; border: 1px solid #eee0b2; border-radius: 8px; padding: 6px 10px; }

      .card { min-height: 220px; }
      .empty { text-align: center; padding: 84px 24px; }
      .empty b { font-size: 15px; font-weight: 700; color: #313d4d; }
      .empty p { margin-top: 10px; font-size: 14px; color: #8a8f98; }

      .report { padding: 26px 28px 24px; }
      .rpt-head {
        display: flex;
        justify-content: space-between;
        align-items: flex-end;
        gap: 16px;
        flex-wrap: wrap;
        border-bottom: 2px solid #e9dec4;
        padding-bottom: 16px;
      }
      .rpt-office {
        font-family: 'Playfair Display', Georgia, serif;
        font-weight: 800;
        font-size: 23px;
        color: var(--navy);
      }
      .rpt-contact { margin-top: 4px; font-size: 13.5px; color: #7c848e; }
      .rpt-right { text-align: right; }
      .rpt-kind {
        font-size: 11px;
        letter-spacing: 0.18em;
        text-transform: uppercase;
        font-weight: 700;
        color: var(--gold);
      }
      .rpt-period {
        margin-top: 3px;
        font-family: 'Playfair Display', Georgia, serif;
        font-weight: 700;
        font-size: 19px;
        color: var(--navy);
      }

      .rpt-summary { display: flex; gap: 16px; margin-top: 18px; flex-wrap: wrap; }
      .rpt-big {
        flex: 1;
        min-width: 170px;
        border: 1px solid var(--border-2);
        border-radius: 12px;
        padding: 14px 16px 13px;
      }
      .rpt-big span {
        display: block;
        font-size: 11px;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        color: var(--muted);
        font-weight: 600;
      }
      .rpt-big b {
        display: block;
        margin-top: 6px;
        font-family: 'Playfair Display', Georgia, serif;
        font-weight: 700;
        font-size: 27px;
        color: var(--navy);
      }

      .rpt-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 34px; margin-top: 24px; }
      .report h4 { font-size: 15px; font-weight: 700; color: #313d4d; margin: 0 0 8px; }
      .rpt-records-title { margin-top: 26px; }

      /* records per day chart */
      .day-chart { display: flex; align-items: flex-end; gap: 3px; height: 150px; padding: 10px 6px 0; }
      .daybar { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: flex-end; height: 100%; min-width: 0; }
      .daycol {
        width: 100%;
        min-height: 0;
        border-radius: 4px 4px 2px 2px;
        background: linear-gradient(180deg, var(--gold), var(--navy));
        transition: height 0.25s ease;
      }
      .daynum {
        font-size: 8.5px;
        color: #9aa3b0;
        padding-top: 5px;
        font-variant-numeric: tabular-nums;
      }
      .day-caption { margin: 8px 2px 0; font-size: 12px; color: #98a0aa; }

      .table.mini td { border-top: 0; border-bottom: 1px solid #f0ede3; padding: 9px 2px; font-size: 13.5px; }
      .table.mini tr:last-child td { border-bottom: 0; }
      .table.mini td.num { text-align: right; color: var(--navy); font-weight: 700; }
      .table.mini .total-row { background: #fbf3dd; border-radius: 8px; font-weight: 700; color: #31333a; }
      .table.mini td.total-row.num { color: var(--navy); }
      .muted { color: #98a0aa; }

      .table.rows th { background: var(--panel-2); }
      .empty-cell { text-align: center; color: #98a0aa; padding: 26px 10px; }

      .rpt-foot {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 12px;
        flex-wrap: wrap;
        margin-top: 24px;
        padding-top: 16px;
        border-top: 1px solid #f0ede3;
        color: var(--muted);
        font-size: 13px;
      }
      .rpt-btns { display: flex; gap: 10px; flex-wrap: wrap; }

      /* day chart column numbers stay readable in print */
      @media print {
        .daynum { color: #666; }
        .no-print { display: none !important; }
      }

      @media (max-width: 760px) {
        .rpt-grid { grid-template-columns: 1fr; }
      }
    `,
  ],
})
export class Reports {
  auth = inject(AuthService);
  private rec = inject(RecordsService);
  private dts = inject(DocTypesService);
  settings = inject(SettingsService);

  monthNames = MONTH_NAMES;
  now = new Date();
  month = this.now.getMonth();
  year = this.now.getFullYear();

  @ViewChild('reportCard') card?: ElementRef<HTMLElement>;

  report: MonthlyReport | null = null;

  /** true when the selects no longer match the generated report on screen */
  get stale(): boolean {
    return !!this.report && (Number(this.month) !== this.report.month || Number(this.year) !== this.report.year);
  }

  get yearOptions(): number[] {
    const y = new Date().getFullYear();
    const out: number[] = [];
    for (let i = y - 2; i <= y + 1; i++) out.push(i);
    return out;
  }

  fmt(iso: string): string {
    return fmtDate(iso);
  }

  dayTitle(d: { day: number; count: number }): string {
    const r = this.report;
    if (!r) return `${d.day}`;
    return `${r.monthLabel} ${r.year}, day ${d.day} — ${d.count} document${d.count === 1 ? '' : 's'}`;
  }

  /**
   * THE FIX: month/year come out of <select> as strings — compare and pass
   * numbers only, otherwise byMonth() returns zero rows and the report looks
   * stuck on the previously generated period.
   */
  onPeriodChange(): void {
    this.month = Number(this.month);
    this.year = Number(this.year);
    this.generate(false);
  }

  generate(scroll: boolean): void {
    const m = Number(this.month);
    const y = Number(this.year);
    if (Number.isNaN(m) || Number.isNaN(y)) return;
    const rows = this.rec.byMonth(y, m);
    this.report = buildMonthlyReport(
      rows,
      this.dts.types.map((t) => t.name),
      m,
      y,
    );
    if (scroll) {
      setTimeout(() => this.card?.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 50);
    }
  }

  /** PDF via the browser print dialog (no extra dependencies). */
  exportPdf(): void {
    window.print();
  }

  /** Excel-ready CSV export of the shown report. */
  exportExcel(): void {
    const r = this.report;
    if (!r || r.total === 0) return;
    downloadCsv(
      `notarix-monthly-report-${r.year}-${String(r.month + 1).padStart(2, '0')}.csv`,
      ['Month', 'Year', 'Document No.', 'Type', 'Client Name', 'Date Notarized', 'Status', 'Location'],
      r.records.map((x) => [r.monthLabel, r.year, x.documentNo, x.type, x.clientName, x.dateNotarized, x.status, x.location]),
    );
  }
}

function REPORT_LABEL(report: MonthlyReport | null, day: number): string {
  return report ? `${report.monthLabel} ${report.year}` : '';
}
