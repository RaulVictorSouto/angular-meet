import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

@Component({
  selector: 'app-switch-dark-mode',
  standalone: true,
  imports: [],
  templateUrl: './switch-dark-mode.component.html',
  styleUrl: './switch-dark-mode.component.css',
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class SwitchDarkModeComponent {
  isDarkMode: boolean = false;

  darkMode() {
    console.log('Valor anterior de isDarkMode:', this.isDarkMode);

    if (this.isDarkMode === false) {
      this.isDarkMode = true;
      console.log('darkmode ativado');
    } else {
      this.isDarkMode = false;
      console.log('darkmode desativado');
    }

    console.log('Novo valor de isDarkMode:', this.isDarkMode);
  }
}
