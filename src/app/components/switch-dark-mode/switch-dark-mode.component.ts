import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { DataService } from '../../chat/shared.service';

@Component({
  selector: 'app-switch-dark-mode',
  standalone: true,
  imports: [],
  templateUrl: './switch-dark-mode.component.html',
  styleUrl: './switch-dark-mode.component.css',
  schemas: [CUSTOM_ELEMENTS_SCHEMA]

})

export class SwitchDarkModeComponent {

  constructor(public dataService: DataService) {}

  darkMode() {
    this.dataService.toggleDarkMode(true);
  }
}
