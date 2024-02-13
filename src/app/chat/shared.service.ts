import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { Message } from './types/message';
import {webSocket, WebSocketSubject} from 'rxjs/webSocket';

export const WS_ENDPOINT = 'ws://localhost:8801';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  userName: string = '';

  private socket$: WebSocketSubject<any>;

  private messagesSubject = new Subject<Message>();
  public messages$ = this.messagesSubject.asObservable();

  constructor() {}

  public connect(): void{
    this.socket$ = this.getNewWebSocket();
  }

  sendMessage(msg: Message): void{
    console.log('Sending message: ' + msg.type);
    this.socket$.next(msg);
  }

  public getNewWebSocket(): WebSocketSubject<any>{
    return webSocket({
      url: WS_ENDPOINT,
      openObserver: {
        next: () => {
          console.log('UserService: connection OK')
        }
      },
      closeObserver: {
        next: () => {
          console.log('UserService: cnnection closed')
          this.socket$ = undefined;
          this.connect();
        }
      }
    });
  }
}
