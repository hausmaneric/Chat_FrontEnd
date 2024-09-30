import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { io, Socket } from 'socket.io-client';

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private url = 'http://localhost:5000'; // Altere conforme necessário
  private socket: Socket;

  constructor() {
    this.socket = io(this.url, { transports: ['websocket', 'polling', 'flashsocket'] });
    console.log(this.socket)
  }

  joinRoom(data: any): void {
    this.socket.emit('join', data);
  }

  sendMessage(data: any): void {
    this.socket.emit('message', data);
  }

  // Se você decidir implementar manipuladores para 'image' e 'arquivo' no servidor:
  sendImage(data: any): void {
    this.socket.emit('image', data);
  }

  sendArquivo(data: any): void {
    this.socket.emit('arquivo', data);
  }

  getMessage(): Observable<any> {
    return new Observable<{ user: string, message: string, image?: string, arquivo?: string, dados_arquivo?: string }>(observer => {
      this.socket.on('new message', (data) => {
        observer.next(data);
      });

      return () => {
        this.socket.disconnect();
      };
    });
  }

  getStorage(): any[] {
    const storage = localStorage.getItem('chats');
    return storage ? JSON.parse(storage) : [];
  }

  setStorage(data: any): void {
    localStorage.setItem('chats', JSON.stringify(data));
  }
}
