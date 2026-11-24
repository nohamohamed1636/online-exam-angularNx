import { Route } from '@angular/router';
import { AuthLayout } from './layout/auth-layout';

export const appRoutes: Route[] = [
  {
    path: '',
    component: AuthLayout,
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'login'
      },
      {
        path: 'login',
        loadComponent: () =>
          import('./features/auth/login/login')
            .then(m => m.Login)
      },
      {
        path: 'register',
        loadComponent: () =>
          import('./features/auth/register/register')
            .then(m => m.Register)
      },
      {
        path: 'forgot-password',
        loadComponent: () =>
          import('./features/auth/forgot-password/forgot-password')
            .then(m => m.ForgotPassword)
      },

      {
        path: 'forgot-password',
        loadComponent: () =>
        import('./features/auth/forgot-password/forgot-password')
        .then(m => m.ForgotPassword)
      },
      {
        path: 'password-reset-sent',
        loadComponent: () =>
        import('./features/auth/password-reset-sent/password-reset-sent')
        .then(m => m.PasswordResetSent)
      },
      {
        path: 'reset-password',
        loadComponent: () =>
        import('./features/auth/reset-password/reset-password')
        .then(m => m.ResetPassword)
      }

    ]
  },
  {
    path: '**',
    redirectTo: 'login'
  }

];
