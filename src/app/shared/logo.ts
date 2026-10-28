import { Component, Input } from '@angular/core';

/**
 * NOTARIX logo mark — recreation of the brand logo:
 * serif monogram + document sheet + fountain-pen nib + gold orbit.
 *
 * tone="color" — full navy & gold, for light backgrounds (login page).
 * tone="light" — white & gold, for dark backgrounds (landing page, dark surfaces).
 */
@Component({
  selector: 'app-logo-mark',
  template: `
    <svg
      [attr.viewBox]="'0 0 150 118'"
      [attr.width]="width()"
      [attr.height]="width() * 0.7867"
      fill="none"
      role="img"
      aria-label="Notarix logo"
    >
      <defs>
        <linearGradient id="lgm-gold" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#e9c76a" />
          <stop offset="1" stop-color="#c9a544" />
        </linearGradient>
        <linearGradient id="lgm-navy" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#27548a" />
          <stop offset="1" stop-color="#1b3a5c" />
        </linearGradient>
      </defs>

      @if (tone === 'color') {
        <!-- document sheet (top-right) -->
        <path d="M104 6h23l13 13v37a5 5 0 0 1-5 5h-31a5 5 0 0 1-5-5V11a5 5 0 0 1 5-5z" fill="url(#lgm-navy)" />
        <path d="M127 6v13h13z" fill="#f4f1e9" />
        <g stroke="#ffffff" stroke-width="3.4" stroke-linecap="round">
          <path d="M110 33h19" />
          <path d="M110 41h23" />
          <path d="M110 49h16" />
        </g>

        <!-- serif monogram -->
        <text
          x="57"
          y="110"
          text-anchor="middle"
          font-family="'Playfair Display', Georgia, serif"
          font-weight="700"
          font-size="106"
          fill="url(#lgm-navy)"
        >N</text>

        <!-- gold orbit -->
        <ellipse cx="73" cy="83" rx="63" ry="20.5" transform="rotate(-17 73 83)" stroke="url(#lgm-gold)" stroke-width="7" />
        <ellipse cx="73" cy="83" rx="63" ry="20.5" transform="rotate(-17 73 83)" stroke="#f0d78c" stroke-width="10" stroke-dasharray="52 360" stroke-dashoffset="230" stroke-linecap="round" />

        <!-- fountain pen nib -->
        <path d="M74 31c8 10 11 20 5 27l-6 7-10-12c-5-9 1-16 11-22z" fill="url(#lgm-gold)" />
        <path d="M74.5 51v14" stroke="#8a6a14" stroke-width="2.2" stroke-linecap="round" />
        <circle cx="74.5" cy="52.5" r="2.6" fill="#8a6a14" />
        <path d="M69 30c-7-8-17-11-25-6" stroke="url(#lgm-gold)" stroke-width="2.4" opacity="0.9" />
      } @else {
        <!-- light variant: white & gold for dark backgrounds -->
        <path d="M104 6h23l13 13v37a5 5 0 0 1-5 5h-31a5 5 0 0 1-5-5V11a5 5 0 0 1 5-5z" fill="#ffffff" />
        <path d="M127 6l13 13h-4a9 9 0 0 1-9-9z" fill="#e9c76a" />
        <g stroke="#1b3a5c" stroke-opacity="0.75" stroke-width="3.4" stroke-linecap="round">
          <path d="M110 33h19" />
          <path d="M110 41h23" />
          <path d="M110 49h16" />
        </g>

        <text
          x="57"
          y="110"
          text-anchor="middle"
          font-family="'Playfair Display', Georgia, serif"
          font-weight="700"
          font-size="106"
          fill="#ffffff"
        >N</text>

        <ellipse cx="73" cy="83" rx="63" ry="20.5" transform="rotate(-17 73 83)" stroke="url(#lgm-gold)" stroke-width="7" />
        <ellipse cx="73" cy="83" rx="63" ry="20.5" transform="rotate(-17 73 83)" stroke="#f5dfa0" stroke-width="10" stroke-dasharray="52 360" stroke-dashoffset="230" stroke-linecap="round" />

        <path d="M74 31c8 10 11 20 5 27l-6 7-10-12c-5-9 1-16 11-22z" fill="url(#lgm-gold)" />
        <path d="M74.5 51v14" stroke="#8a6a14" stroke-width="2.2" stroke-linecap="round" />
        <circle cx="74.5" cy="52.5" r="2.6" fill="#8a6a14" />
        <path d="M69 30c-7-8-17-11-25-6" stroke="url(#lgm-gold)" stroke-width="2.4" opacity="0.9" />
      }
    </svg>
  `,
  styles: [
    `
      :host { display: block; line-height: 0; }
    `,
  ],
})
export class LogoMark {
  /** 'color' (navy & gold) or 'light' (white & gold) */
  @Input() tone: 'color' | 'light' = 'color';

  private w = 150;
  @Input() set logoWidth(v: number) {
    this.w = v;
  }
  width(): number {
    return this.w;
  }
}
