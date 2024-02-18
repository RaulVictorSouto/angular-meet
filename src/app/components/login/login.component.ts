import { Component, OnInit} from '@angular/core';
import { AppComponent } from '../../app.component';
import { SwitchDarkModeComponent } from "../switch-dark-mode/switch-dark-mode.component";
import {RouterModule} from '@angular/router';
import { LogoComponent } from "../logo/logo.component";
import { ReuniaoComponent } from "../../pages/reuniao/reuniao.component";
import { DataService } from '../../chat/shared.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';


@Component({
    selector: 'app-login',
    standalone: true,
    templateUrl: './login.component.html',
    styleUrl: './login.component.css',
    imports: [AppComponent, SwitchDarkModeComponent, RouterModule, LogoComponent, ReuniaoComponent, FormsModule, CommonModule]
})

export class LoginComponent implements OnInit {
  userName: string = '';
  isDarkMode: boolean = false;

  constructor(private dataService: DataService) {}

  ngOnInit(): void {
    // Inscreva-se para receber atualizações sobre o status do dark mode
    this.dataService.isDarkMode$.subscribe((isDarkMode: boolean) => {
      this.isDarkMode = isDarkMode;
    });
  }

  setUserNameAndNavigate(): void {
    this.dataService.userName = this.userName;
    console.log("Nome de usuário definido:", this.dataService.userName);
  }

  toggleDarkMode(): void {
    // Alternar o status do dark mode
    this.dataService.toggleDarkMode(!this.isDarkMode);
  }
}

