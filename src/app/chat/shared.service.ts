import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { Message } from './types/message';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  userName: string = '';
  isDarkMode$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  private socket$: WebSocketSubject<any> | any;

  private messagesSubject = new Subject<Message>();
  public messages$ = this.messagesSubject.asObservable();

  constructor() {
    this.socket$ = this.getNewWebSocket();
  }

  public connect(): void {
    this.socket$ = this.getNewWebSocket();
  }

  sendMessage(msg: Message): void {
    console.log('Sending message: ' + msg.type);
    this.socket$.next(msg);
  }

  public getNewWebSocket(): WebSocketSubject<any> {
    return webSocket({
      url: environment.wsEndpoint,
      openObserver: {
        next: () => {
          console.log('DataService: connection OK')
        }
      },
      closeObserver: {
        next: () => {
          console.log('DataService: connection closed')
          this.socket$ = undefined;
          this.connect();
        }
      }
    });
  }

  toggleDarkMode(isDarkMode: boolean): void {
    this.isDarkMode$.next(isDarkMode);
  }
}
