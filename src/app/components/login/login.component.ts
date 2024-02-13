import { Component} from '@angular/core';
import { AppComponent } from '../../app.component';
import { SwitchDarkModeComponent } from "../switch-dark-mode/switch-dark-mode.component";
import {RouterModule} from '@angular/router';
import { LogoComponent } from "../logo/logo.component";
import { ReuniaoComponent } from "../../pages/reuniao/reuniao.component";
import { UserService } from '../../chat/shared.service';
import { FormsModule } from '@angular/forms';


@Component({
    selector: 'app-login',
    standalone: true,
    templateUrl: './login.component.html',
    styleUrl: './login.component.css',
    imports: [AppComponent, SwitchDarkModeComponent, RouterModule, LogoComponent, ReuniaoComponent, FormsModule]
})
export class LoginComponent{
  userName: string = '';

  constructor(private userService: UserService) {}

  setUserNameAndNavigate(): void {
    this.userService.userName = this.userName;
    console.log("Nome de usuário definido:", this.userService.userName);
  }
}


