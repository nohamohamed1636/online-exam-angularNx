import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {
  LucideAward,
  LucideBookOpenCheck,
  LucideRectangleEllipsis,
  LucideFolderCode,
  LucideBrain
} from '@lucide/angular';
@Component({
  selector: 'app-auth-layout',
  imports: [
    RouterOutlet,
    LucideAward,
    LucideBookOpenCheck,
    LucideRectangleEllipsis,
    LucideFolderCode,
    LucideBrain
  ],
  templateUrl: './auth-layout.html',
  styleUrl: './auth-layout.css',
})
export class AuthLayout {}
