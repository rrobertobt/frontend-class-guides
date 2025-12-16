import { Component } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-todos-display',
  imports: [],
  templateUrl: './todos-display.html',
  styleUrl: './todos-display.css',
})
export class TodosDisplay {
  constructor(public auth: AuthService) {}
}
