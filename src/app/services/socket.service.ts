import {Injectable} from '@angular/core';
import {Socket} from "ngx-socket-io";

@Injectable({
  providedIn: 'root'
})
export class SocketService {
  constructor(private socket: Socket) {
  }

  joinChannel(room: string){
    this.socket.emit('join', room);
  }

  sendMessage(data: string, room: string, event: string) {
    this.socket.emit('events', JSON.stringify({ room: room, event: event, data: data}));
  }

  getMessage(event: string) {
    return this.socket.fromEvent(event);
  }
}
