import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Socket } from 'socket.io';
import { User } from 'src/auth/entities/user.entity';
import { Repository } from 'typeorm';
interface ConectClients {
  [id: string]: {
    socket: Socket;
    user: User;
  };
}
@Injectable()
export class MeassagesWsService {
  private connectedClients: ConectClients = {};

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}
  async registerClient(client: Socket, id: string) {
    const user = await this.userRepository.findOneBy({ id });
    if (!user) {
      throw new Error('User Not Found');
    }
    if (!user.isActive) {
      throw new Error('User Not Active');
    }
    this.connectedClients[client.id] = {
      socket: client,
      user,
    };
  }
  removeClient(clientId: string) {
    delete this.connectedClients[clientId];
  }

  getConnectedClients(): string[] {
    return Object.keys(this.connectedClients);
  }
  getUserFullName(id: string): string {
    return this.connectedClients[id].user.fullName;
  }
}
