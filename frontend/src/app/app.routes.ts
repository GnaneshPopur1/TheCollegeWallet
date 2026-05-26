import { Routes } from '@angular/router';
import { Dashboard } from './features/dashboard/dashboard';
import { EducationHub } from './features/education-hub/education-hub';
import { FixedCosts } from './features/fixed-costs/fixed-costs';
import { Subscriptions } from './features/subscriptions/subscriptions';
import { Budgets } from './features/budgets/budgets';
import { Register } from './features/auth/register/register';
import { Login } from './features/auth/login/login';

export const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  { path: 'login', component: Login },
  { path: 'register', component: Register },
  { path: 'dashboard', component: Dashboard },
  { path: 'education', component: EducationHub },
  { path: 'costs', component: FixedCosts },
  { path: 'subscriptions', component: Subscriptions },
  { path: 'budgets', component: Budgets }
];
