import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
// import { NxWelcome } from './nx-welcome';
import {LucideEye} from '@lucide/angular';

@Component({
  imports: [RouterModule,
    LucideEye,],
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected title = 'online-exam';
}
