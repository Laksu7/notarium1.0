import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

type LeaveStatus = 'Pending' | 'Approved' | 'Rejected';
type LeaveRequest = {  id: string;
  employee: string;
  type: string;
  start: string;
  end: string;
  days: number;
  status: LeaveStatus;
  reason: string;
};
type AuditEntry = { action: string; detail: string; time: string; actor: string };

const REQUESTS_KEY = 'peopleflow.requests';
const AUDIT_KEY = 'peopleflow.audit';

/**
 * Legacy "PeopleFlow" employee leave-management demo, preserved verbatim from an
 * earlier prototype. It is not imported anywhere and is tree-shaken from the
 * production bundle; it exists here only as a historical reference.
 */
@Component({
  imports: [CommonModule, FormsModule],
  selector: 'app-peopleflow-legacy',
  styleUrl: './peopleflow.css',
  templateUrl: './peopleflow.html',
})
export class PeopleflowLegacy {
  readonly navItems = [
    { name: 'Dashboard', icon: '⌂' },
    { name: 'My Leave', icon: '▣' },
    { name: 'Apply for Leave', icon: '＋' },
    { name: 'Team Calendar', icon: '▦' },
    { name: 'Holidays', icon: '✿' },
    { name: 'Leave Policies', icon: '▤' },
    { name: 'Approvals', icon: '✓' },
    { name: 'Reports', icon: '▥' },
    { name: 'Employees', icon: '♙' },
    { name: 'Audit Log', icon: '◷' },
    { name: 'Settings', icon: '⚙' },
  ];
  readonly holidays = [
    { month: 'NOV', day: '27', name: 'Bonifacio Day', kind: 'National holiday' },
    { month: 'DEC', day: '08', name: 'Feast of the Immaculate Conception', kind: 'National holiday' },
    { month: 'DEC', day: '25', name: 'Christmas Day', kind: 'National holiday' },
  ];
  readonly balances = [
    { type: 'Annual Leave', days: 12, total: 15, color: 'blue' },
    { type: 'Sick Leave', days: 10, total: 10, color: 'green' },
    { type: 'Casual Leave', days: 5, total: 5, color: 'violet' },
  ];

  selectedPage = 'Dashboard';
  currentMonth = new Date(2026, 10, 1);
  showNotifications = false;
  showProfileMenu = false;
  toastMessage = '';
  requestType = 'Annual Leave';
  startDate = '';
  endDate = '';
  reason = '';
  requestError = '';
  auditEntries: AuditEntry[] = [];
  requests: LeaveRequest[] = [];

  constructor() {
    this.requests = this.readStored(REQUESTS_KEY, this.seedRequests());
    this.auditEntries = this.readStored(AUDIT_KEY, this.seedAudit());
  }

  get pendingRequests(): LeaveRequest[] {
    return this.requests.filter((request) => request.status === 'Pending');
  }

  get myRequests(): LeaveRequest[] {
    return this.requests.filter((request) => request.employee === 'Althea M. Santos');
  }

  get approvedThisYear(): number {
    return this.requests.filter((request) => request.status === 'Approved').length + 6;
  }

  get approvedRequestsCount(): number {
    return this.requests.filter((request) => request.status === 'Approved').length;
  }

  get pageDescription(): string {
    const descriptions: Record<string, string> = {
      'Apply for Leave': 'Submit a request and keep track of its approval status.',
      'My Leave': 'View your leave balance and request history.',
      'Team Calendar': 'See team leave schedules and upcoming holidays.',
      Holidays: 'Plan ahead with upcoming public holidays.',
      'Leave Policies': 'Understand your leave allowances and request guidelines.',
      Approvals: 'Review and manage employee leave requests.',
      Reports: 'Review leave activity and request status.',
      Employees: 'View your team directory and account status.',
      'Audit Log': 'Review important changes and account activity.',
      Settings: 'Manage session, data backup, and system safeguards.',
    };
    return descriptions[this.selectedPage] ?? 'Manage leave with confidence.';
  }

  get monthLabel(): string {
    return this.currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  }

  get calendarDays(): Array<{ day: number; date: Date | null }> {
    const year = this.currentMonth.getFullYear();
    const month = this.currentMonth.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const cells: Array<{ day: number; date: Date | null }> = [];
    for (let i = 0; i < firstDay; i++) cells.push({ day: 0, date: null });
    for (let day = 1; day <= daysInMonth; day++) cells.push({ day, date: new Date(year, month, day) });
    while (cells.length % 7 !== 0) cells.push({ day: 0, date: null });
    return cells;
  }

  get duration(): number {
    if (!this.startDate || !this.endDate) return 0;
    const start = new Date(`${this.startDate}T00:00:00`);
    const end = new Date(`${this.endDate}T00:00:00`);
    return Math.round((end.getTime() - start.getTime()) / 86400000) + 1;
  }

  get awayToday(): number {
    const today = new Date().toISOString().slice(0, 10);
    return this.requests.filter((request) => request.status === 'Approved' && request.start <= today && request.end >= today).length;
  }

  selectPage(name: string): void {
    this.selectedPage = name;
    this.requestError = '';
    if (name === 'Apply for Leave') this.showToast('');
  }

  changeMonth(offset: number): void {
    this.currentMonth = new Date(this.currentMonth.getFullYear(), this.currentMonth.getMonth() + offset, 1);
  }

  setRequestDate(which: 'start' | 'end', value: string): void {
    if (which === 'start') this.startDate = value;
    else this.endDate = value;
    this.requestError = '';
  }

  submitRequest(): void {
    this.requestError = '';
    if (!this.startDate || !this.endDate || !this.reason.trim()) {
      this.requestError = 'Please complete the dates and reason before submitting.';
      return;
    }
    if (this.duration < 1) {
      this.requestError = 'The end date must be on or after the start date.';
      return;
    }
    const conflict = this.requests.some((request) =>
      request.employee === 'Althea M. Santos' &&
      request.status !== 'Rejected' &&
      this.startDate <= request.end &&
      this.endDate >= request.start,
    );
    if (conflict) {
      this.requestError = 'These dates overlap another pending or approved request.';
      return;
    }
    const balance = this.balances.find((item) => item.type === this.requestType);
    if (balance && this.duration > balance.days) {
      this.requestError = `This request exceeds your ${balance.type.toLowerCase()} balance of ${balance.days} days.`;
      return;
    }
    const id = `LR-2026-${String(Date.now()).slice(-4)}`;
    this.requests = [{
      id, employee: 'Althea M. Santos', type: this.requestType, start: this.startDate,
      end: this.endDate, days: this.duration, status: 'Pending', reason: this.reason.trim(),
    }, ...this.requests];
    this.persistRequests();
    this.recordAudit('Request submitted', `${id} · ${this.requestType} · ${this.duration} day${this.duration === 1 ? '' : 's'}`);
    this.startDate = '';
    this.endDate = '';
    this.reason = '';
    this.selectedPage = 'My Leave';
    this.showToast('Leave request submitted for approval');
  }

  updateStatus(request: LeaveRequest, status: LeaveStatus): void {
    this.requests = this.requests.map((item) => item.id === request.id ? { ...item, status } : item);
    this.persistRequests();
    this.recordAudit(`Request ${status.toLowerCase()}`, `${request.id} · ${request.employee}`);
    this.showToast(`${request.employee}'s request ${status.toLowerCase()}`);
  }

  exportBackup(): void {
    const backup = {
      exportedAt: new Date().toISOString(),
      requests: this.requests,
      auditLog: this.auditEntries,
    };
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `peopleflow-backup-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
    this.recordAudit('Backup exported', 'Requests and audit log downloaded as JSON');
    this.showToast('Backup downloaded');
  }

  endSession(): void {
    this.recordAudit('Session ended', 'User signed out');
    localStorage.removeItem('peopleflow.session');
    this.showProfileMenu = false;
    this.showToast('You have been signed out');
  }

  toggleNotifications(): void {
    this.showNotifications = !this.showNotifications;
    this.showProfileMenu = false;
  }

  statusClass(status: LeaveStatus): string {
    return status.toLowerCase();
  }

  private persistRequests(): void {
    this.writeStored(REQUESTS_KEY, this.requests);
  }

  private recordAudit(action: string, detail: string): void {
    this.auditEntries = [{
      action, detail, actor: 'Althea M. Santos',
      time: new Date().toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' }),
    }, ...this.auditEntries];
    this.writeStored(AUDIT_KEY, this.auditEntries);
  }

  private showToast(message: string): void {
    this.toastMessage = message;
    if (message) window.setTimeout(() => {
      if (this.toastMessage === message) this.toastMessage = '';
    }, 3200);
  }

  private readStored<T>(key: string, fallback: T): T {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    try {
      return JSON.parse(raw) as T;
    } catch {
      localStorage.removeItem(key);
      return fallback;
    }
  }

  private writeStored(key: string, value: unknown): void {
    localStorage.setItem(key, JSON.stringify(value));
  }

  private seedRequests(): LeaveRequest[] {
    return [
      { id: 'LR-2026-0146', employee: 'Althea M. Santos', type: 'Annual Leave', start: '2026-11-10', end: '2026-11-12', days: 3, status: 'Pending', reason: 'Family trip with my family.' },
      { id: 'LR-2026-0139', employee: 'Althea M. Santos', type: 'Sick Leave', start: '2026-10-21', end: '2026-10-21', days: 1, status: 'Approved', reason: 'Medical appointment' },
      { id: 'LR-2026-0127', employee: 'Althea M. Santos', type: 'Annual Leave', start: '2026-09-15', end: '2026-09-17', days: 3, status: 'Rejected', reason: 'Team coverage required' },
      { id: 'LR-2026-0152', employee: 'Juan Dela Cruz', type: 'Annual Leave', start: '2026-11-28', end: '2026-12-02', days: 3, status: 'Pending', reason: 'Family vacation' },
      { id: 'LR-2026-0153', employee: 'Maria Torres', type: 'Sick Leave', start: '2026-11-27', end: '2026-11-27', days: 1, status: 'Pending', reason: 'Medical appointment' },
    ];
  }

  private seedAudit(): AuditEntry[] {
    return [
      { action: 'Request submitted', detail: 'LR-2026-0146 · Annual Leave · 3 days', actor: 'Althea M. Santos', time: 'Oct 18, 2026, 9:42 AM' },
      { action: 'Request approved', detail: 'LR-2026-0139 · Sick Leave', actor: 'PeopleFlow Admin', time: 'Oct 16, 2026, 2:18 PM' },
      { action: 'Policy updated', detail: 'Annual leave entitlement reviewed', actor: 'PeopleFlow Admin', time: 'Oct 12, 2026, 11:05 AM' },
    ];
  }
}
