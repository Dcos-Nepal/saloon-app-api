import { Model } from 'mongoose';
import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import BaseService from 'src/base/base-service';
import { ChatRoom, IChatRoom } from './interfaces/chat-room.interface';
import { ChatRoomDto, ChatRoomQueryDto } from './dto/chat-room.dto';

@Injectable()
export class ChatRoomService extends BaseService<ChatRoom, IChatRoom> {
  private logger: Logger;

  constructor(@InjectModel('C_Room') private readonly chatRoomModel: Model<ChatRoom>) {
    super(chatRoomModel);
    this.logger = new Logger(ChatRoomService.name);
  }

  /**
   * Creates a Chat Room
   *
   * @param createChatRoom
   * @returns ChatRoom
   */
  async createRoom(createChatRoom: ChatRoomDto) {
    this.logger.log(`Create: Create chat room`);

    const chatRoom = new this.chatRoomModel(createChatRoom);
    const room = await chatRoom.save();

    this.logger.log(`Create: Created chat room of ${room._id} successfully `);
    return room;
  }

  /**
   * Get List of Chat Rooms
   *
   * @param query ChatRoomQueryDto
   * @returns ChatRoom[]
   */
  async fetchChatRooms(query: ChatRoomQueryDto) {
    this.logger.log(`FindAll: fetch chat rooms, set query payload `);

    const { owner, member, limit = 10, offset = 0, sort = 'createdAt', order = 'desc' } = query;

    const sortQuery = {};
    const dataQuery = {};

    sortQuery[sort] = order;
    if (owner) dataQuery['owner'] = owner;
    if (member) dataQuery['members'] = { $elemMatch: { $eq: member } };

    const chatRooms = await this.chatRoomModel
      .find({ ...dataQuery })
      .populate('owner', '_id firstName lastName')
      .populate('members', '_id firstName lastName')
      .sort(sortQuery)
      .skip(+offset)
      .limit(+limit)
      .exec();

    this.logger.log(`FindAll: fetched chat request successfully`);
    return chatRooms;
  }
}
