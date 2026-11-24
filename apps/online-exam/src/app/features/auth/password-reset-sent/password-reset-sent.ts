import {Component,inject,signal,OnInit} from '@angular/core';
import {Router,RouterLink} from '@angular/router';

import { Location } from '@angular/common';


@Component({
  imports: [RouterLink],
  selector: 'app-password-reset-sent',
  styleUrl: './password-reset-sent.css',
  templateUrl: './password-reset-sent.html',
})
export class PasswordResetSent implements OnInit{

  private readonly router = inject(Router);
  private readonly location = inject(Location);

  readonly email = signal('');

  ngOnInit(): void {

    const state = this.location.getState() as {
      email?: string;
    };

    if (!state?.email) {

      void this.router.navigate(
        ['/forgot-password'],
        { replaceUrl: true }
      );

      return;
    }

    this.email.set(state.email);
  }

  goBack(): void {

    void this.router.navigate([
      '/forgot-password'
    ]);

  }

}

