import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { InicioComponent } from './pages/inicio/inicio.component';
import { ReuniaoComponent } from "./pages/reuniao/reuniao.component";

@Component({
    selector: 'app-root',
    standalone: true,
    templateUrl: './app.component.html',
    styleUrl: './app.component.css',
    imports: [RouterOutlet, InicioComponent, ReuniaoComponent]
})
export class AppComponent {
  title = 'Friends';

  }

