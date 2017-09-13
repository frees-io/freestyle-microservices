import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { WebSocketSubject } from 'rxjs/observable/dom/WebSocketSubject';
// Operators
import 'rxjs/add/observable/dom/webSocket';


@Injectable()
export class WsService {

  private wsUrl = 'ws://localhost:8080/metrics';
  // private wsUrl = 'ws://localhost:3000';
  // private wsUrl = 'ws://echo.websocket.org/';

  private wsc = {
    url: this.wsUrl,
    resultSelector: this.wscResultSelector
  };

  /**
   * Here we are customizing the way of handling the websocket data,
   * to handle cases where the message is not a proper JSON. If what we
   * expect receiving from the server is a JSON we can rely on the
   * default implementation of ResultSelector (which does a JSON.parse)
   * @param e
   */
  private wscResultSelector<MessageEvent>(e: MessageEvent): any {
    return e;
  }

  constructor() { }

  /**
   * By using the WebSocketSubject data type we can abstract from some inner quirky
   * checks and operations that we would need by using ordinary subjects/observables.
   * The WebSocketSubject is basically a wrapper around the w3c compatible object on
   * stereoids, i.e. observable/subjects capabilities
   *
   * This method open a new websocket connection and returns a subject
   */
  getSubject(): WebSocketSubject<any> {
    const subject: WebSocketSubject<any> = Observable.webSocket(this.wsc);
    return subject;
  }

}
