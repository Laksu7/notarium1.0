import { Routes } from '@angular/router';
import { authGuard, adminGuard } from './core/guards';
import { Landing } from './pages/landing/landing';
import { Login } from './pages/login/login';
import { Layout } from './layout/layout';
import { Dashboard } from './pages/dashboard/dashboard';
import { Records } from './pages/records/records';
import { Reports } from './pages/reports/reports';
import { Staff } from './pages/staff/staff';
import { DocTypes } from './pages/doctypes/doctypes';
import { Settings } from './pages/settings/settings';

export const routes: Routes = [
  { path: '', pathMatch: 'full', component: Landing },
  { path: 'login', component: Login },
  {
    path: '',
    component: Layout,
    canActivate: [authGuard],
    children: [
      { path: 'dashboard', component: Dashboard, data: { title: 'Dashboard' } },
      { path: 'records', component: Records, data: { title: 'Notarization Records' } },
      { path: 'reports', component: Reports, data: { title: 'Reports' } },
      { path: 'staff', component: Staff, data: { title: 'Staff Accounts' }, canActivate: [adminGuard] },
      { path: 'document-types', component: DocTypes, data: { title: 'Document Types' }, canActivate: [adminGuard] },
      { path: 'settings', component: Settings, data: { title: 'Office Settings' }, canActivate: [adminGuard] },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
    ],
  },
  { path: '**', redirectTo: '' },
];
