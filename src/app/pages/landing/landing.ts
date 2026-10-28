import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../core/auth';
import { UiIcon } from '../../shared/icon';
import { LogoMark } from '../../shared/logo';

@Component({
  selector: 'app-landing',
  imports: [UiIcon, LogoMark],
  template: `
    <div class="land">
      <!-- decorative shapes -->
      <div class="d d-box-1"></div>
      <div class="d d-box-2"></div>
      <div class="d d-box-3"></div>
      <div class="d d-circle-1"></div>
      <div class="d d-circle-2"></div>
      <div class="d d-base"></div>

      <svg class="d d-scale" viewBox="0 0 900 460" fill="none" stroke="rgba(122,146,187,0.16)" stroke-width="16" stroke-linecap="round">
        <path d="M450 320V150" />
        <path d="M240 180h420" />
        <path d="M240 180l-52 92M240 180l52 92" />
        <path d="M162 285a78 58 0 0 0 156 0" />
        <path d="M660 180l-52 92M660 180l52 92" />
        <path d="M582 285a78 58 0 0 0 156 0" />
        <path d="M390 410h120" />
      </svg>

      <main class="land-inner">
        <div class="land-mark">
          <app-logo-mark tone="light" [logoWidth]="128" />
        </div>

        <h1 class="land-title">NOTAR<span>IX</span></h1>
        <p class="land-sub">Digitalized Notarization Record Management System</p>
        <p class="land-tag">Accurate&ensp;&ensp;·&ensp;&ensp;Organized&ensp;&ensp;·&ensp;&ensp;Trusted</p>

        <div class="land-actions">
          <button class="btn btn-gold btn-lg" type="button" (click)="goLogin()">Login</button>
          <button class="btn btn-ghost btn-lg" type="button" (click)="learnMore()">Learn More</button>
        </div>
      </main>

      <section id="features" class="land-features">
        <article>
          <ui-icon name="check" size="22" />
          <h2>Accurate.</h2>
          <p>Every notarized document is recorded with its own document number, date, and status — nothing slips through the cracks.</p>
        </article>
        <article>
          <ui-icon name="grid" size="22" />
          <h2>Organized.</h2>
          <p>Records, document types, and monthly reports stay neatly arranged, so staff can find anything in seconds.</p>
        </article>
        <article>
          <ui-icon name="feather" size="22" />
          <h2>Trusted.</h2>
          <p>A dependable digital trail from the office to the central records — built for a smoother legal process.</p>
        </article>
      </section>
    </div>
  `,
  styles: [
    `
      .land {
        min-height: 100vh;
        position: relative;
        overflow: hidden;
        color: #f2eee1;
        background:
          radial-gradient(1100px 620px at 78% -12%, #24466f 0%, rgba(36, 70, 111, 0) 62%),
          radial-gradient(900px 520px at 12% 112%, #14213b 0%, rgba(20, 33, 59, 0) 60%),
          linear-gradient(158deg, #29496f 0%, #203a61 44%, #182e51 100%);
      }
      .d { position: absolute; pointer-events: none; }

      .d-box-1 { top: -130px; left: -110px; width: 440px; height: 460px; background: #1c3557; border-radius: 26px; opacity: 0.5; }
      .d-box-2 { bottom: -180px; left: 110px; width: 480px; height: 420px; background: #172b4a; border-radius: 24px; opacity: 0.55; }
      .d-box-3 { bottom: -220px; left: 60px; width: 620px; height: 360px; background: #142341; border-radius: 22px; opacity: 0.6; }
      .d-circle-1 { top: -220px; right: 8%; width: 520px; height: 520px; border-radius: 50%; background: radial-gradient(circle at 30% 30%, rgba(84, 118, 168, 0.35), rgba(84, 118, 168, 0) 68%); }
      .d-circle-2 { bottom: -140px; right: -120px; width: 560px; height: 560px; border-radius: 50%; background: rgba(31, 54, 88, 0.55); }
      .d-base { bottom: 0; left: 0; right: 0; height: 26px; background: #cdd3da; opacity: 0.85; }
      .d-scale { left: 50%; bottom: 4%; width: 900px; max-width: 90vw; transform: translateX(-38%) rotate(-3deg); }

      .land-inner {
        position: relative;
        z-index: 2;
        max-width: 1200px;
        margin: 0 auto;
        padding: 0 48px;
        display: block;
      }
      .land-mark { margin-top: 22vh; }
      .land-title {
        margin: 6px 0 0;
        font-family: 'Playfair Display', Georgia, serif;
        font-weight: 800;
        font-size: 78px;
        letter-spacing: 0.045em;
        color: #f6f1e3;
        line-height: 1;
      }
      .land-title span { color: #d5ae4f; }
      .land-sub { margin-top: 14px; font-size: 17px; font-weight: 600; color: #c6d0e2; }
      .land-tag {
        margin-top: 14px;
        font-family: 'Playfair Display', Georgia, serif;
        font-size: 21px;
        letter-spacing: 0.32em;
        color: #d8b95e;
      }
      .land-actions { display: flex; gap: 14px; margin-top: 34px; }
      .btn-lg { padding: 12px 26px; font-size: 15px; }

      .land-features {
        position: relative;
        z-index: 2;
        max-width: 1200px;
        margin: 14vh auto 0;
        padding: 0 48px 90px;
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 22px;
      }
      .land-features article {
        background: rgba(12, 22, 40, 0.35);
        border: 1px solid rgba(255, 255, 255, 0.09);
        border-radius: 16px;
        padding: 24px 26px 28px;
        backdrop-filter: blur(3px);
      }
      .land-features .app-icon { color: #d5ae4f; }
      .land-features h2 {
        margin-top: 12px;
        font-family: 'Playfair Display', Georgia, serif;
        font-size: 23px;
        color: #f6f1e3;
      }
      .land-features p { margin-top: 8px; font-size: 14px; line-height: 1.65; color: #b9c4d8; }
    `,
  ],
})
export class Landing {
  private router = inject(Router);
  private auth = inject(AuthService);

  goLogin(): void {
    this.router.navigate([this.auth.user ? '/dashboard' : '/login']);
  }

  learnMore(): void {
    document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
  }
}
