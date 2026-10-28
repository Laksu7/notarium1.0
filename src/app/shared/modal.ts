import { Component, ContentChild, EventEmitter, Input, Output, TemplateRef, inject } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { UiIcon } from './icon';

@Component({
  selector: 'ui-modal',
  imports: [NgTemplateOutlet, UiIcon],
  styles: [
    `
      .ov {
        position: fixed;
        inset: 0;
        background: rgba(15, 23, 32, 0.45);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 60;
        padding: 20px;
        animation: ov-in 0.18s ease;
      }
      @keyframes ov-in {
        from {
          opacity: 0;
        }
        to {
          opacity: 1;
        }
      }
      .box {
        background: #fff;
        border-radius: 16px;
        box-shadow: 0 24px 64px -16px rgba(15, 23, 32, 0.35);
        width: 100%;
        overflow: hidden;
        animation: box-in 0.2s ease;
        max-height: calc(100vh - 40px);
        display: flex;
        flex-direction: column;
      }
      @keyframes box-in {
        from {
          opacity: 0;
          transform: translateY(10px) scale(0.98);
        }
        to {
          opacity: 1;
          transform: none;
        }
      }
      @media (max-width: 600px) {
        .box {
          max-width: calc(100vw - 32px) !important;
        }
      }
      .head {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 17px 20px;
        border-bottom: 1px solid #f0ede3;
        flex: none;
      }
      .title {
        font-family: 'Playfair Display', Georgia, serif;
        font-weight: 700;
        font-size: 18px;
        color: #1f3a5f;
      }
      .x {
        width: 32px;
        height: 32px;
        border: 0;
        background: transparent;
        border-radius: 9px;
        color: #8a8f98;
        display: inline-flex;
        align-items: center;
        justify-content: center;
      }
      .x:hover {
        background: #f4f1e9;
        color: #22303f;
      }
      .bd {
        padding: 20px;
        overflow-y: auto;
      }
      .ft {
        padding: 15px 20px;
        border-top: 1px solid #f0ede3;
        display: flex;
        justify-content: flex-end;
        gap: 10px;
        flex: none;
      }
    `,
  ],
  template: `
    @if (open) {
      <div class="ov" (click)="close.emit()">
        <div class="box" [style.max-width]="width" (click)="$event.stopPropagation()">
          <header class="head">
            <div class="title">{{ title }}</div>
            <button type="button" class="x" aria-label="Close" (click)="close.emit()">
              <ui-icon name="close" size="17" />
            </button>
          </header>
          <div class="bd"><ng-content /></div>
          @if (foot) {
            <div class="ft">
              <ng-container [ngTemplateOutlet]="foot" />
            </div>
          }
        </div>
      </div>
    }
  `,
})
export class UiModal {
  @Input() open = false;
  @Input() title = 'Dialog';
  @Input() width = '520px';
  @Output() close = new EventEmitter<void>();
  @ContentChild('foot') foot?: TemplateRef<unknown>;
}
