import { Server } from 'ws';
import { Socket } from 'socket.io';
import { SubscribeMessage, WebSocketGateway, OnGatewayInit, WebSocketServer, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Logger, UseGuards } from '@nestjs/common';
import { WsJwtGuard } from '../auth/guards/jwt-ws-auth.guard';

@WebSocketGateway({ namespace: '/chat', cors: { origin: '*' } })
export class ChatSocketGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;
  private logger: Logger = new Logger('ChatSocketGateway');

  @UseGuards(WsJwtGuard)
  @SubscribeMessage('chat:join-room')
  public joinRoom(client: Socket, room: string): void {
    // Getting connected user
    const user: any = client.handshake.query?.user;

    // Joining Chat Room
    client.join(`channel_${room}`);

    // Let the user know that he has joined the room.
    client.emit('chat:room-joined', room);

    // Looging user's activity.
    this.logger.log(`User ${user.firstName} ${user.lastName} has joined the chat room: channel_${room}`);
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage('chat:leave-room')
  public leaveRoom(client: Socket, room: string): void {
    // Getting connected user
    const user: any = client.handshake.query?.user;

    // Leave the chat room
    client.leave(`channel_${room}`);

    // Let the User know that he has left the room
    client.emit('chat:room-left', room);

    // Logging user's activity.
    this.logger.log(`User ${user.firstName} ${user.lastName} has left the chat room: channel_${room}`);
  }

  public afterInit(): void {
    return this.logger.log('Socket Server Initialized!');
  }

  /**
   * Handles Client Disconnection
   *
   * @param client Socket
   * @returns Void
   */
  public handleDisconnect(client: Socket): void {
    return this.logger.log(`Client disconnected: ${client.id}`);
  }

  /**
   * Handles Client Connection
   *
   * @param client Socket
   * @returns Void
   */
  public handleConnection(client: Socket): void {
    return this.logger.log(`Client connected: ${client.id}`);
  }
}
