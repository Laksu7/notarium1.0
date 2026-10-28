import { Component, Input } from '@angular/core';

type Prim = { d?: string; c?: [number, number, number] };

const ICONS: Record<string, Prim[]> = {
  grid: [{ d: 'M3 3h7v7H3z' }, { d: 'M14 3h7v7h-7z' }, { d: 'M14 14h7v7h-7z' }, { d: 'M3 14h7v7H3z' }],
  file: [
    { d: 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z' },
    { d: 'M14 2v6h6' },
    { d: 'M16 13H8' },
    { d: 'M16 17H8' },
    { d: 'M10 9H8' },
  ],
  chart: [{ d: 'M18 20V10' }, { d: 'M12 20V4' }, { d: 'M6 20v-6' }],
  users: [
    { d: 'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2' },
    { c: [9, 7, 4] },
    { d: 'M23 21v-2a4 4 0 0 0-3-3.87' },
    { d: 'M16 3.13a4 4 0 0 1 0 7.75' },
  ],
  bank: [
    { d: 'M3 21h18' },
    { d: 'M5 21V10' },
    { d: 'M9 21V10' },
    { d: 'M15 21V10' },
    { d: 'M19 21V10' },
    { d: 'M2 10l10-6 10 6' },
  ],
  gear: [
    { c: [12, 12, 3] },
    {
      d: 'M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z',
    },
  ],
  logout: [{ d: 'M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4' }, { d: 'M16 17l5-5-5-5' }, { d: 'M21 12H9' }],
  eye: [{ d: 'M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z' }, { c: [12, 12, 3] }],
  'eye-off': [
    { d: 'M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94' },
    { d: 'M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19' },
    { d: 'M14.12 14.12a3 3 0 1 1-4.24-4.24' },
    { d: 'M1 1l22 22' },
  ],
  edit: [{ d: 'M17 3a2.83 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z' }],
  trash: [
    { d: 'M3 6h18' },
    { d: 'M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2' },
    { d: 'M10 11v6' },
    { d: 'M14 11v6' },
  ],
  plus: [{ d: 'M12 5v14' }, { d: 'M5 12h14' }],
  minus: [{ d: 'M5 12h14' }],
  search: [{ c: [11, 11, 8] }, { d: 'M21 21l-4.35-4.35' }],
  filter: [{ d: 'M22 3H2l8 9.46V19l4 2v-8.54L22 3z' }],
  bell: [{ d: 'M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9' }, { d: 'M13.73 21a2 2 0 0 1-3.46 0' }],
  'chev-down': [{ d: 'M6 9l6 6 6-6' }],
  'chev-left': [{ d: 'M15 18l-6-6 6-6' }],
  'chev-right': [{ d: 'M9 18l6-6-6-6' }],
  close: [{ d: 'M18 6L6 18' }, { d: 'M6 6l12 12' }],
  user: [{ c: [12, 7, 4] }, { d: 'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2' }],
  lock: [{ d: 'M5 11h14v11H5z' }, { d: 'M8 11V7a4 4 0 0 1 8 0v4' }],
  login: [{ d: 'M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4' }, { d: 'M10 17l5-5-5-5' }, { d: 'M15 12H3' }],
  calendar: [
    { d: 'M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z' },
    { d: 'M16 2v4' },
    { d: 'M8 2v4' },
    { d: 'M3 10h18' },
  ],
  feather: [{ d: 'M20.24 12.24a6 6 0 0 0-8.49-8.49L5 10.5V19h8.5z' }, { d: 'M16 8L2 22' }, { d: 'M17.5 15H9' }],
  check: [{ d: 'M20 6L9 17l-5-5' }],
  print: [
    { d: 'M6 9V2h12v7' },
    { d: 'M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2' },
    { d: 'M6 14h12v8H6z' },
  ],
  save: [
    { d: 'M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z' },
    { d: 'M17 21v-8H7v8' },
    { d: 'M7 3v5h8' },
  ],
  building: [{ d: 'M3 21h18' }, { d: 'M9 21v-6h6v6' }, { d: 'M5 21V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16' }],
};

@Component({
  selector: 'ui-icon',
  template: `
    <svg
      [attr.width]="size"
      [attr.height]="size"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      [attr.stroke-width]="stroke"
      stroke-linecap="round"
      stroke-linejoin="round"
      aria-hidden="true"
    >
      @for (p of prims; track $index) {
        @if (p.c) {
          <circle [attr.cx]="p.c[0]" [attr.cy]="p.c[1]" [attr.r]="p.c[2]" />
        } @else {
          <path [attr.d]="p.d" />
        }
      }
    </svg>
  `,
  host: { class: 'app-icon' },
})
export class UiIcon {
  @Input({ required: true }) name!: string;
  @Input() size: number | string = 18;
  @Input() stroke: number | string = 1.8;

  get prims(): Prim[] {
    return ICONS[this.name] ?? [];
  }
}
