import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

/**
 * Root shell. Renders the routed NOTANIX application
 * (landing → login → dashboard / records / reports / admin pages).
 *
 * The previous "PeopleFlow" leave-management demo that lived here has been
 * preserved verbatim in src/app/legacy/peopleflow.* — it was blocking the
 * router (no <router-outlet> in its template), which prevented NOTANIX
 * pages from ever rendering.
 */
@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  template: `<router-outlet />`,
})
export class App {}
