import { Server } from 'ws'
import { Socket } from 'socket.io'
import {
  SubscribeMessage,
  WebSocketGateway,
  OnGatewayInit,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WsResponse
} from '@nestjs/websockets'
import { Logger } from '@nestjs/common'

@WebSocketGateway({ namespace: '/chat', cors: { origin: '*' } })
export class SocketGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server

  private logger: Logger = new Logger('SocketGateway')

  @SubscribeMessage('chat:send-message')
  public handleMessage(client: Socket, payload: any): Promise<WsResponse<any>> {
    return this.server.to(payload.room).emit('chat:receive-message', payload)
  }

  @SubscribeMessage('chat:join-room')
  public joinRoom(client: Socket, room: string): void {
    client.join(room)
    client.emit('chat:room-joined', room)
  }

  @SubscribeMessage('chat:leave-room')
  public leaveRoom(client: Socket, room: string): void {
    client.leave(room)
    client.emit('chat:room-left', room)
  }

  public afterInit(): void {
    return this.logger.log('Socket Server Initialized!')
  }

  public handleDisconnect(client: Socket): void {
    return this.logger.log(`Client disconnected: ${client.id}`)
  }

  public handleConnection(client: Socket): void {
    return this.logger.log(`Client connected: ${client.id}`)
  }
}
