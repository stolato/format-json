import { Injectable, NgZone } from '@angular/core';
import { Socket } from "ngx-socket-io";
import { Observable, Subject } from "rxjs";
import { SessionService } from "./session.service";

export interface SocketErrorEvent {
  error: string;
  room?: string;
}

const ACK_TIMEOUT = 5000;
/** Intervalo mínimo entre tentativas de renovar a sessão disparadas pelo socket. */
const REFRESH_GUARD_MS = 10000;

/**
 * Cliente do namespace /items (servidor Socket.IO v3, protocolo v4).
 *
 * - Envia o access token no handshake (`auth.token`), lido a cada conexão.
 * - Reconecta sempre que o token muda (login, renovação, logout) e refaz os joins.
 * - Trata SESSION_ENDED renovando o token (ou seguindo como anônimo).
 */
@Injectable({
  providedIn: 'root'
})
export class SocketService {
  private rooms = new Set<string>();
  private lastRefreshAttempt = 0;

  /** Erros vindos do servidor (ack `{ok:false}` ou evento `error_message`). */
  readonly errors$ = new Subject<SocketErrorEvent>();

  constructor(private socket: Socket, private session: SessionService, private zone: NgZone) {
    const io = this.socket.ioSocket;
    io.auth = (cb: (data: object) => void) => {
      const token = this.session.token;
      cb(token ? { token } : {});
    };

    this.session.tokenChanged$.subscribe(() => this.reconnect());

    io.on('connect', () => {
      this.rooms.forEach((room) => this.emitJoin(room));
    });

    io.on('error_message', (payload: any) => {
      const error = typeof payload === 'string' ? payload : payload?.error || payload?.message;
      if (!error) return;
      this.zone.run(() => this.errors$.next({ error, room: payload?.room }));
    });

    io.on('disconnect', (reason) => {
      // O servidor fechou a conexão (ex.: SESSION_ENDED): o cliente não reconecta sozinho.
      if (reason === 'io server disconnect') this.recoverSession();
    });

    io.on('connect_error', () => {
      // Token rejeitado no handshake: tenta renovar uma vez.
      if (!io.active && this.session.token) this.recoverSession();
    });
  }

  /** Reconecta com o token atual e refaz os joins (no evento `connect`). */
  reconnect() {
    const io = this.socket.ioSocket;
    io.disconnect();
    io.connect();
  }

  joinChannel(room: string) {
    if (!room) return;
    this.rooms.add(room);
    if (this.socket.ioSocket.connected) this.emitJoin(room);
  }

  disconnectChannel(room: string) {
    if (!this.rooms.delete(room)) return;
    if (this.socket.ioSocket.connected) this.socket.emit('leave', room);
  }

  /** `room` precisa ser exatamente o valor usado no join. */
  sendMessage(data: string, room: string, event: string) {
    if (!this.rooms.has(room)) return;
    this.socket.emit('events', JSON.stringify({ room: room, event: event, data: data }));
  }

  getMessage<T = any>(event: string): Observable<T> {
    return this.socket.fromEvent(event) as Observable<T>;
  }

  private async emitJoin(room: string) {
    try {
      const res: any = await this.socket.ioSocket.timeout(ACK_TIMEOUT).emitWithAck('join', room);
      if (res && res.ok === false && res.error) {
        if (res.error === 'NOT_FOUND') this.rooms.delete(room);
        this.zone.run(() => this.errors$.next({ error: res.error, room }));
      }
    } catch {
      // timeout: o próximo `connect` refaz o join
    }
  }

  private recoverSession() {
    const io = this.socket.ioSocket;
    const now = Date.now();
    // Evita loop caso o servidor continue recusando a conexão.
    if (now - this.lastRefreshAttempt < REFRESH_GUARD_MS) return;
    this.lastRefreshAttempt = now;

    if (!this.session.refreshToken) {
      if (!io.connected) io.connect();
      return;
    }
    // Sucesso ou sessão expirada disparam tokenChanged$ → reconnect().
    this.session.refresh().catch(() => {
      if (!io.connected) io.connect();
    });
  }
}
