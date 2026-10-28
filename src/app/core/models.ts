export type Role = 'admin' | 'staff';

export interface User {
  id: number;
  name: string;
  email: string;
  password: string;
  role: Role;
}

export type RecordStatus = 'In Office' | 'For Submission' | 'Submitted';

export interface NotarizationRecord {
  id: number;
  documentNo: string;
  type: string;
  clientName: string;
  /** yyyy-mm-dd */
  dateNotarized: string;
  status: RecordStatus;
  location: string;
}

export interface DocType {
  id: number;
  name: string;
}

export interface OfficeSettings {
  name: string;
  address: string;
  contact: string;
}

export const STATUSES: RecordStatus[] = ['In Office', 'For Submission', 'Submitted'];

/**
 * Statuses offered by the record forms (Add / Edit / Track / Bulk update).
 * "In Office" remains in the data model only for legacy records created
 * before this version — it can no longer be chosen for new entries.
 */
export const FORM_STATUSES: RecordStatus[] = ['For Submission', 'Submitted'];

/** The only two offices used by the system. */
export const LOCATIONS = ['Pasalan Law Office', 'Main Office'];

/** Where a record physically sits depending on its status. */
export function locationFor(status: RecordStatus, current = ''): string {
  if (status === 'For Submission') return 'Pasalan Law Office';
  if (status === 'Submitted') return 'Main Office';
  // legacy "In Office" — keep the current location if still valid
  return LOCATIONS.includes(current) ? current : LOCATIONS[0];
}

export const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export function monthYearLabel(d: Date): string {
  return MONTH_NAMES[d.getMonth()] + ' ' + d.getFullYear();
}

export function fmtDate(iso: string): string {
  if (!iso) return '—';
  const d = new Date(iso + 'T00:00:00');
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/);
  const a = parts[0]?.[0] ?? '';
  const b = parts.length > 1 ? parts[parts.length - 1][0] : '';
  return (a + b).toUpperCase() || '?';
}
