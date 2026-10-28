import { Injectable, inject } from '@angular/core';
import { StorageService } from './storage';
import { OfficeSettings } from './models';

const SETTINGS_KEY = 'notarixp.settings';

@Injectable({ providedIn: 'root' })
export class SettingsService {
  private store = inject(StorageService);

  settings: OfficeSettings;

  constructor() {
    this.settings = this.store.read<OfficeSettings | null>(SETTINGS_KEY, null) ?? {
      name: 'Pasalan Law Office',
      address: 'pob. 2',
      contact: '09123456789',
    };
    this.store.write(SETTINGS_KEY, this.settings);
  }

  save(s: OfficeSettings): void {
    this.settings = { ...s };
    this.store.write(SETTINGS_KEY, this.settings);
  }
}
