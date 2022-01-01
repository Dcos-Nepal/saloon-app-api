import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AppService } from 'src/app.service';
import { AppSocketGateway } from 'src/app.socket';
import { ConfigService } from 'src/configs/config.service';
import { UsersModule } from '../users/users.module';

import { ChatMessageService } from './chat-message.service';
import { ChatRequestService } from './chat-request.service';
import { ChatRoomService } from './chat-room.service';

import { ChatController } from './chat.controller';
import { ChatSocketGateway } from './chat.socket';
import { ChatMessageSchema } from './schemas/chat-message.schema';
import { ChatRequestSchema } from './schemas/chat-request.schema';
import { ChatRoomSchema } from './schemas/chat-room.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'C_Request', schema: ChatRequestSchema },
      { name: 'C_Room', schema: ChatRoomSchema },
      { name: 'C_Message', schema: ChatMessageSchema }
    ]),
    UsersModule
  ],
  controllers: [ChatController],
  providers: [ConfigService, AppSocketGateway, ChatSocketGateway, AppService, ChatRequestService, ChatRoomService, ChatMessageService]
})
export class ChatModule {}
