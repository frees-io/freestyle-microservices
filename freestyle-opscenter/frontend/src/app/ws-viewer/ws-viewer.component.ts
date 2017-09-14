import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';

import { WsService } from './ws.service';

@Component({
  selector: 'app-ws-viewer',
  templateUrl: './ws-viewer.component.html',
  styleUrls: ['./ws-viewer.component.scss']
})
export class WsViewerComponent implements OnInit {
  title = 'WebSockets example';
  value: number;
  subscription: Subscription;

  constructor(private wsService: WsService) { }

  ngOnInit() { }

  startListening() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
    const wsSubject = this.wsService.getSubject();
    // If the websocket is “cold” we need to send a first message to get it started
    wsSubject.next('hello');
    this.subscription = wsSubject.subscribe(
      (msg) => {
        console.log(msg);
        // mySocket.next(data);
        this.value = msg.data;
      }
    );
  }

  isCurrentlyListening(): boolean {
    return (this.subscription && !this.subscription.closed);
  }

  toggleListening() {
    this.isCurrentlyListening() ? this.stopListening() : this.startListening();
  }

  stopListening() {
    this.subscription.unsubscribe();
  }

}
