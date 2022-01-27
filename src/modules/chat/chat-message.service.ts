import { Model } from 'mongoose';
import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import BaseService from 'src/base/base-service';
import { ChatMessage, IChatMessage } from './interfaces/chat-message.interface';
import { User } from '../users/interfaces/user.interface';
import { ChatMessageDto, ChatMessageQueryDto } from './dto/chat-message.dto';
import { ChatRoomService } from './chat-room.service';
import { ChatSocketGateway } from './chat.socket';
import { ChatRoom } from './interfaces/chat-room.interface';

@Injectable()
export class ChatMessageService extends BaseService<ChatMessage, IChatMessage> {
  private logger: Logger;

  constructor(
    @InjectModel('C_Message') private readonly chatMessageModel: Model<ChatMessage>,
    private readonly chatRoomService: ChatRoomService,
    private readonly chatSocket: ChatSocketGateway
  ) {
    super(chatMessageModel);
    this.logger = new Logger(ChatMessageService.name);
  }

  /**
   * Create Chat Message using the provided data
   *
   * @param createChatMessage ChatRequestDto
   * @returns JSON
   */
  async createChatMessage(sender: User, roomId: string, createChatMessage: ChatMessageDto) {
    const chatRoom = await this.chatRoomService.findById(roomId);

    if (!chatRoom) {
      // Throw Exception!
      throw new NotFoundException('Chat Room is not found!');
    }

    this.logger.log(`Create: Create chat message `);
    createChatMessage.room = roomId;
    createChatMessage.from = sender._id.toString();
    createChatMessage.date = new Date();

    const chatMessage = new this.chatMessageModel(createChatMessage);
    const message: ChatMessage = await chatMessage.save();

    this.logger.log(`Create: Created Chat message of ${message._id} successfully `);

    this.sendMessageToRoom(chatRoom, { id: sender._id, name: sender.firstName + ' ' + sender.lastName }, message);

    // Then return the sent message
    return message;
  }

  /**
   * Sends the Chat Message in the given Chat Room
   *
   * @param room ChatRoom
   * @param message ChatMessage
   * @returns void
   */
  private sendMessageToRoom = (room: ChatRoom, sender: { id: string; name: string }, chatMessage: ChatMessage): void => {
    return this.chatSocket.server.to(`channel_${room._id}`).emit('chat:receive-message', {
      sender,
      message: chatMessage.message,
      date: chatMessage.date
    });
  };

  /**
   * Fetch messages asper given filter params
   *
   * @param roomId String
   * @param query ChatMessageQueryDto
   * @returns ChatMessage[]
   */
  async filterChatMessages(roomId: string, query: ChatMessageQueryDto) {
    this.logger.log(`FindAll: Fetch chat Messages as per message query params`);
    const chatRoom = await this.chatRoomService.findById(roomId);

    if (!chatRoom) {
      // Throw Exception!
      throw new NotFoundException('Chat Room is not found!');
    }

    const { from, to, limit = 10, offset = 0, sort = 'createdAt', order = 'desc' } = query;

    const sortQuery = {};
    const dataQuery = {};

    sortQuery[sort] = order;

    if (to) dataQuery['to'] = to;
    if (from) dataQuery['from'] = from;
    if (roomId) dataQuery['room'] = roomId;

    const chatMessages = await this.chatMessageModel
      .find({ ...dataQuery })
      .populate('from', '_id firstName lastName')
      .populate('to', '_id firstName lastName')
      .populate('room', '_id name')
      .sort(sortQuery)
      .skip(+offset)
      .limit(+limit)
      .exec();

    this.logger.log(`FindAll: Fetched chat messages successfully`);
    return chatMessages;
  }
}
