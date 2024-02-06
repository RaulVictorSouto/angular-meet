import { Routes } from '@angular/router';
import { InicioComponent } from './pages/inicio/inicio.component';
import { ReuniaoComponent } from './pages/reuniao/reuniao.component';

export const routes: Routes = [
  {
    path:'',
    component:InicioComponent
  },
  {
    path:'meeting',
    component:ReuniaoComponent
  }
];
