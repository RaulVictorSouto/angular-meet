import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { LoginComponent } from '../../components/login/login.component';

@Component({
  selector: 'app-inicio',
  standalone: true,
  imports: [LoginComponent],
  templateUrl: './inicio.component.html',
  styleUrl: './inicio.component.css',
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class InicioComponent {

}
