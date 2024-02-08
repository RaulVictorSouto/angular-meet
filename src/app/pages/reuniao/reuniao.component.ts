import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit} from '@angular/core';
import { UserService } from '../../shared.service';
import { Session, Call } from '@apizee/apirtc';

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
  session: Session | undefined; // Objeto de sessão apiRTC

  constructor(private userService: UserService) {}

  ngOnInit(): void {
    this.userName = this.userService.userName;
    console.log("Nome de usuário recuperado:", this.userName);

    //Incializa a função
    this.session = new Session();

    const call = this.session.createCall();
    call.addStream({ audio:true, video: true});
    call.call('outbound-media-element-id')
}
