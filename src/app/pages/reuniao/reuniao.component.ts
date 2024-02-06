import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit} from '@angular/core';
import { UserService } from '../../shared.service';

@Component({
  selector: 'app-reuniao',
  standalone: true,
  imports: [],
  templateUrl: './reuniao.component.html',
  styleUrl: './reuniao.component.css',
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class ReuniaoComponent implements OnInit {
  userName: string = '';

  constructor(private userService: UserService) {}

  ngOnInit(): void {
    this.userName = this.userService.userName;
    console.log("Nome de usuário recuperado:", this.userName);
  }
}
