import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/auth';
import { UiIcon } from '../../shared/icon';

@Component({
  selector: 'app-login',
  imports: [FormsModule, UiIcon],
  template: `
    <div class="lgn">
      <div class="lgn-corner tl"><span class="ring"></span></div>
      <div class="lgn-corner br"><span class="ring"></span></div>
      <div class="lgn-blob b1"></div>
      <div class="lgn-blob b2"></div>
      <div class="lgn-blob b3"></div>

      <div class="lgn-center">
        <div class="lgn-brand">
          <svg viewBox="0 0 120 88" width="120" height="88" fill="none">
            <g opacity="0.35" stroke="#c9a544" stroke-width="2">
              <rect x="76" y="4" width="30" height="40" rx="4" />
              <path d="M82 14h12M82 22h16M82 30h10" stroke-linecap="round" />
            </g>
            <ellipse cx="50" cy="56" rx="36" ry="13" stroke="#c9a544" stroke-width="6" transform="rotate(-16 50 56)" />
            <path d="M56 12c10 13 13 24 7 33l-7 9-8-10c-6-10-2-20 8-32z" fill="#c9a544" />
            <path d="M55 30v22" stroke="#7c5c14" stroke-width="2" stroke-linecap="round" />
            <circle cx="55" cy="49" r="2.6" fill="#7c5c14" />
          </svg>
        </div>
        <div class="lgn-name">NOTARIX</div>
        <div class="lgn-line1">Digitalized Notarization</div>
        <div class="lgn-line2">Record Management System</div>

        <form class="lgn-card" (ngSubmit)="submit()">
          <h1 class="lgn-title">Welcome Back!</h1>
          <p class="lgn-sub">Sign in to your account</p>

          @if (error) {
            <div class="lgn-error">
              <ui-icon name="close" size="14" />
              <span>{{ error }}</span>
            </div>
          }

          <label class="lgn-field">
            <ui-icon name="user" size="17" />
            <input
              type="email"
              name="email"
              placeholder="Email address"
              autocomplete="username"
              [(ngModel)]="email"
              required
            />
          </label>

          <label class="lgn-field">
            <ui-icon name="lock" size="17" />
            <input
              [type]="show ? 'text' : 'password'"
              name="password"
              placeholder="Password"
              autocomplete="current-password"
              [(ngModel)]="password"
              required
            />
            <button type="button" class="lgn-eye" aria-label="Toggle password" (click)="show = !show">
              <ui-icon [name]="show ? 'eye' : 'eye-off'" size="17" />
            </button>
          </label>

          <button class="lgn-btn" type="submit">Login</button>

          <p class="lgn-foot">Don't have an account? <b>Contact your admin.</b></p>

          <div class="lgn-hint">
            <b>Demo accounts</b>
            <span>Admin — admin&#64;notarium.com / admin123</span>
            <span>Staff — secretary&#64;notarium.com / staff123</span>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [
    `
      .lgn {
        min-height: 100vh;
        position: relative;
        display: flex;
        align-items: center;
        justify-content: center;
        overflow: hidden;
        background:
          radial-gradient(560px 420px at 86% 20%, #d3dbe6 0%, rgba(211, 219, 230, 0) 70%),
          radial-gradient(620px 480px at 8% 78%, #cdd5df 0%, rgba(205, 213, 223, 0) 70%),
          linear-gradient(170deg, #e6eaf0 0%, #eef0f3 55%, #e9edf2 100%);
      }
      .lgn-corner {
        position: absolute;
        width: 420px;
        height: 420px;
        background: #29466b;
        z-index: 1;
      }
      .lgn-corner.tl { top: -230px; left: -90px; border-bottom-left-radius: 92%; }
      .lgn-corner.br { bottom: -250px; right: -100px; border-top-right-radius: 92%; }
      .ring {
        position: absolute;
        inset: -26px auto auto -34px;
        width: 330px;
        height: 290px;
        border: 3px solid #c9a544;
        border-radius: 50%;
        opacity: 0.55;
        display: block;
      }
      .lgn-corner.br .ring { inset: auto -34px -22px auto; }
      .lgn-blob {
        position: absolute;
        border-radius: 26px;
        filter: blur(6px);
        opacity: 0.35;
        background: linear-gradient(160deg, #9fb0c6, #b9c4d2);
      }
      .b1 { top: 12%; left: 9%; width: 130px; height: 150px; }
      .b2 { bottom: 16%; left: 24%; width: 210px; height: 170px; opacity: 0.28; }
      .b3 { top: 34%; right: 12%; width: 260px; height: 260px; border-radius: 50%; opacity: 0.22; }

      .lgn-center { position: relative; z-index: 2; text-align: center; padding: 30px 16px 40px; }
      .lgn-brand { display: inline-block; }
      .lgn-name {
        margin-top: 6px;
        font-family: 'Playfair Display', Georgia, serif;
        font-weight: 800;
        font-size: 40px;
        letter-spacing: 0.14em;
        color: #1f3a5f;
        text-indent: 0.14em;
      }
      .lgn-line1 { margin-top: 6px; font-size: 15px; font-weight: 700; color: #33455e; }
      .lgn-line2 { margin-top: 3px; font-size: 14.5px; color: #66707c; }

      .lgn-card {
        margin: 34px auto 0;
        width: 420px;
        max-width: 94vw;
        background: #fff;
        border-radius: 18px;
        box-shadow: 0 30px 70px -22px rgba(24, 40, 60, 0.35);
        padding: 34px 38px 28px;
        text-align: center;
      }
      .lgn-title {
        font-family: 'Playfair Display', Georgia, serif;
        font-weight: 800;
        font-size: 27px;
        color: #1f3a5f;
      }
      .lgn-sub { margin-top: 8px; font-size: 14px; color: #7c848e; }

      .lgn-error {
        margin-top: 14px;
        display: flex;
        align-items: center;
        gap: 8px;
        background: #fdeeee;
        border: 1px solid #f2cfcf;
        color: #a03d34;
        border-radius: 10px;
        padding: 10px 12px;
        font-size: 13.5px;
        text-align: left;
      }

      .lgn-field {
        margin-top: 14px;
        display: flex;
        align-items: center;
        gap: 10px;
        background: #eef2f8;
        border: 1px solid #dee4ed;
        border-radius: 12px;
        padding: 0 14px;
        height: 48px;
        transition: border-color 0.15s, box-shadow 0.15s;
      }
      .lgn-field:focus-within { border-color: rgba(31, 58, 95, 0.45); box-shadow: 0 0 0 3px rgba(31, 58, 95, 0.08); background: #fff; }
      .lgn-field .app-icon { color: #8a93a1; }
      .lgn-field input {
        flex: 1;
        min-width: 0;
        border: 0;
        outline: 0;
        background: transparent;
        font-family: inherit;
        font-size: 14.5px;
        color: #22303f;
      }
      .lgn-field input::placeholder { color: #9aa3b0; }
      .lgn-eye {
        border: 0;
        background: transparent;
        color: #97a1b0;
        border-radius: 8px;
        padding: 4px;
        display: inline-flex;
      }
      .lgn-eye:hover { color: #22303f; }

      .lgn-btn {
        margin-top: 18px;
        width: 100%;
        height: 48px;
        border: 0;
        border-radius: 12px;
        background: #1e3a5f;
        color: #fff;
        font-family: inherit;
        font-size: 15px;
        font-weight: 600;
        letter-spacing: 0.01em;
        transition: background 0.15s;
      }
      .lgn-btn:hover { background: #294a78; }

      .lgn-foot { margin-top: 16px; font-size: 13.5px; color: #7c848e; }
      .lgn-foot b { color: #1f3a5f; font-weight: 700; cursor: pointer; }

      .lgn-hint {
        margin-top: 18px;
        border-top: 1px dashed #e2ddd0;
        padding-top: 14px;
        font-size: 12.5px;
        color: #98a0aa;
        display: flex;
        flex-direction: column;
        gap: 3px;
      }
      .lgn-hint b { color: #6d7683; font-weight: 600; }
    `,
  ],
})
export class Login {
  private auth = inject(AuthService);
  private router = inject(Router);

  email = '';
  password = '';
  show = false;
  error = '';

  ngOnInit(): void {
    if (this.auth.user) {
      this.router.navigate(['/dashboard']);
    }
  }

  submit(): void {
    this.error = '';
    if (!this.email.trim() || !this.password) {
      this.error = 'Please enter your email and password.';
      return;
    }
    if (this.auth.login(this.email, this.password)) {
      this.router.navigate(['/dashboard']);
    } else {
      this.error = 'Invalid email or password. Please try again.';
    }
  }
}
