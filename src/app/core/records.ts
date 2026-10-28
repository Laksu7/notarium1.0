import { Injectable, inject } from '@angular/core';
import { StorageService } from './storage';
import { MONTH_NAMES, LOCATIONS, FORM_STATUSES, NotarizationRecord, RecordStatus, locationFor } from './models';

const RECORDS_KEY = 'notarixp.records';

export interface Vitals {
  total: number;
  thisMonth: number;
  prevCount: number;
  diff: number;
  prevMonthName: string;
  forSubmission: number;
  submitted: number;
}

@Injectable({ providedIn: 'root' })
export class RecordsService {
  private store = inject(StorageService);

  records: NotarizationRecord[] = [];

  constructor() {
    this.records =
      this.store.read<NotarizationRecord[] | null>(RECORDS_KEY, null) ?? this.seed();
    this.records = this.records.map((r) => this.normalize(r));
    this.store.write(RECORDS_KEY, this.records);
  }

  /**
   * Keeps stored rows consistent with the current office rules:
   * locations outside the two legal values are re-assigned based on status,
   * and the status/location pair for the two main statuses is enforced.
   */
  private normalize(r: NotarizationRecord): NotarizationRecord {
    if (FORM_STATUSES.includes(r.status)) {
      // For Submission → Pasalan Law Office · Submitted → Main Office
      return { ...r, location: locationFor(r.status) };
    }
    // legacy "In Office" — keep its location only if it is still one of the valid offices
    const location = LOCATIONS.includes(r.location) ? r.location : LOCATIONS[0];
    return { ...r, location };
  }

  private seed(): NotarizationRecord[] {
    const d = new Date(Date.now() - 86400000); // yesterday
    const yesterday =
      d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
    return [
      {
        id: 1,
        documentNo: 'hhhhh',
        type: 'Authorization Letter',
        clientName: 'haji wapo',
        dateNotarized: yesterday,
        status: 'In Office',
        location: 'Main Office',
      },
    ];
  }

  commit(): void {
    this.store.write(RECORDS_KEY, this.records);
  }

  list(): NotarizationRecord[] {
    return this.records;
  }

  byId(id: number): NotarizationRecord | undefined {
    return this.records.find((r) => r.id === id);
  }

  add(data: Omit<NotarizationRecord, 'id'>): NotarizationRecord {
    const nextId = this.records.reduce((m, r) => Math.max(m, r.id), 0) + 1;
    const rec = this.normalize({ ...data, id: nextId });
    this.records = [rec, ...this.records];
    this.commit();
    return rec;
  }

  update(id: number, patch: Partial<NotarizationRecord>): void {
    this.records = this.records.map((r) => (r.id === id ? this.normalize({ ...r, ...patch }) : r));
    this.commit();
  }

  /** Updates several records in one operation (bulk status/location change). */
  bulkUpdate(ids: number[], patch: Partial<NotarizationRecord>): void {
    this.records = this.records.map((r) => (ids.includes(r.id) ? this.normalize({ ...r, ...patch }) : r));
    this.commit();
  }

  remove(id: number): void {
    this.records = this.records.filter((r) => r.id !== id);
    this.commit();
  }

  byMonth(year: number, monthIndex: number): NotarizationRecord[] {
    return this.records.filter((r) => {
      const d = new Date(r.dateNotarized + 'T00:00:00');
      return d.getFullYear() === year && d.getMonth() === monthIndex;
    });
  }

  countByType(type: string): number {
    return this.records.filter((r) => r.type === type).length;
  }

  countByStatus(status: RecordStatus): number {
    return this.records.filter((r) => r.status === status).length;
  }

  vitals(): Vitals {
    const now = new Date();
    const prev = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const thisMonth = this.byMonth(now.getFullYear(), now.getMonth()).length;
    const prevCount = this.byMonth(prev.getFullYear(), prev.getMonth()).length;
    return {
      total: this.records.length,
      thisMonth,
      prevCount,
      diff: thisMonth - prevCount,
      prevMonthName: MONTH_NAMES[prev.getMonth()],
      forSubmission: this.records.filter((r) => r.status !== 'Submitted').length,
      submitted: this.countByStatus('Submitted'),
    };
  }
}
