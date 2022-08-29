import { JwtService } from '@nestjs/jwt';
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';

import { Socket, Server } from 'socket.io';
import { NewMessageDto } from './dtos/new-message.dto';
import { MeassagesWsService } from './meassages-ws.service';
import { JwtPayload } from 'src/auth/interfaces/jwt-payload.interface';
@WebSocketGateway({ cors: true })
export class MeassagesWsGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() wss: Server;
  constructor(
    private readonly meassagesWsService: MeassagesWsService,
    private readonly jwtService: JwtService,
  ) {}

  async handleConnection(client: Socket) {
    const tk = client.handshake.headers.authentication as string;
    let payload: JwtPayload;
    try {
      payload = this.jwtService.verify(tk);
      await this.meassagesWsService.registerClient(client, payload.id);
    } catch (error) {
      client.disconnect();
      return;
    }

    this.wss.emit(
      'clients-updated',
      this.meassagesWsService.getConnectedClients(),
    );
  }
  handleDisconnect(client: Socket) {
    this.meassagesWsService.removeClient(client.id);
    this.wss.emit(
      'clients-updated',
      this.meassagesWsService.getConnectedClients(),
    );
  }
  @SubscribeMessage('text')
  handleText(client: Socket, payload: NewMessageDto) {
    this.wss.emit('messages', {
      fullName: this.meassagesWsService.getUserFullName(client.id),
      message: payload.message || 'no-message',
    });
  }
}
