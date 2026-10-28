import { Injectable, inject } from '@angular/core';
import { StorageService } from './storage';
import { RecordsService } from './records';
import { DocType } from './models';

const TYPES_KEY = 'notarixp.types';

@Injectable({ providedIn: 'root' })
export class DocTypesService {
  private store = inject(StorageService);
  private records = inject(RecordsService);

  types: DocType[] = [];

  constructor() {
    this.types = this.store.read<DocType[] | null>(TYPES_KEY, null) ?? this.seed();
    this.store.write(TYPES_KEY, this.types);
  }

  private seed(): DocType[] {
    return [
      'Affidavit of Loss',
      'Affidavit of Support',
      'Authorization Letter',
      'Contract Agreement',
      'Deed of Sale',
      'Others',
      'Special Power of Attorney',
      'Waiver',
    ].map((name, i) => ({ id: i + 1, name }));
  }

  commit(): void {
    this.store.write(TYPES_KEY, this.types);
  }

  list(): DocType[] {
    return [...this.types].sort((a, b) => a.name.localeCompare(b.name));
  }

  names(): string[] {
    return this.list().map((t) => t.name);
  }

  countFor(name: string): number {
    return this.records.countByType(name);
  }

  /** Returns an error message, or null on success. */
  add(name: string): string | null {
    const clean = name.trim();
    if (!clean) return 'Please enter a document type name.';
    if (this.types.some((t) => t.name.toLowerCase() === clean.toLowerCase())) {
      return 'This document type already exists.';
    }
    const id = this.types.reduce((m, t) => Math.max(m, t.id), 0) + 1;
    this.types = [...this.types, { id, name: clean }];
    this.store.write(TYPES_KEY, this.types);
    return null;
  }

  /** Only removes types that are not referenced by any record. */
  removeIfUnused(id: number): boolean {
    const t = this.types.find((x) => x.id === id);
    if (!t || this.countFor(t.name) > 0) return false;
    this.types = this.types.filter((x) => x.id !== id);
    this.store.write(TYPES_KEY, this.types);
    return true;
  }
}
