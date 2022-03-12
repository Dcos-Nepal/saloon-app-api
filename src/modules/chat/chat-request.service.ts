import { Model } from 'mongoose';
import { Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import BaseService from 'src/base/base-service';
import { ChatRequest, IChatRequest } from './interfaces/chat-request.interface';
import { ChatRequestDto, ChatRequestQueryDto } from './dto/chat-request.dto';
import { User } from '../users/interfaces/user.interface';
import { ChatRoomService } from './chat-room.service';
import { ChatRoomDto } from './dto/chat-room.dto';

@Injectable()
export class ChatRequestService extends BaseService<ChatRequest, IChatRequest> {
  private logger: Logger;

  constructor(@InjectModel('C_Request') private readonly chatReqModel: Model<ChatRequest>, private readonly chatRoomService: ChatRoomService) {
    super(chatReqModel);
    this.logger = new Logger(ChatRequestService.name);
  }

  /**
   * Create Chat Request using the provided data
   *
   * @param createChatRequest ChatRequestDto
   * @returns JSON
   */
  async createChatRequest(inviter: User, createChatRequest: ChatRequestDto) {
    this.logger.log(`Create: create chat request `);
    createChatRequest.inviter = inviter._id.toString();

    const chatRequest = new this.chatReqModel(createChatRequest);
    const request = await chatRequest.save();

    this.logger.log(`Create: created chat request of id: ${request._id} successfully `);
    return request;
  }

  /**
   * Accept Chat Request
   *
   * @param invitee
   * @param requestId
   * @returns ChatRequest
   */
  async acceptChatRequest(invitee: User, requestId: string) {
    const chatRequest: ChatRequest = await this.chatReqModel.findById(requestId);
    if (chatRequest.invitee.toString() === invitee._id.toString() && !chatRequest.isAccepted) {
      const chatRoom = new ChatRoomDto();

      chatRoom.name = `Chat with ${invitee.firstName}`;
      chatRoom.owner = chatRequest.inviter;
      chatRoom.members = [chatRequest.inviter.toString(), chatRequest.invitee.toString()];
      chatRoom.isPublic = false;

      // Create a Chat channel using inviter and invitee
      const isRoomCreated = await this.chatRoomService.createRoom(chatRoom);

      if (isRoomCreated) {
        chatRequest.isAccepted = true;
        return this.chatReqModel.findByIdAndUpdate(requestId, chatRequest, { new: true });
      }

      // Throw Exception!
      throw new InternalServerErrorException('Something went wrong in creating chat room!');
    }

    // Throw Exception!
    throw new NotFoundException('Chat Request is not found!');
  }

  /**
   * Find all the Skills based on the given filters
   *
   * @param query SkillQueryDto
   * @returns ChatRequest[]
   */
  async fetchChatRequests(query: ChatRequestQueryDto) {
    this.logger.log(`FindAll: fetch chat request, set query payload`);

    const sortQuery = {};
    const dataQuery = {};
    const { inviter, invitee, limit = 10, offset = 0, sort = 'createdAt', order = 'desc' } = query;

    sortQuery[sort] = order;

    if (inviter) dataQuery['inviter'] = inviter;
    if (invitee) dataQuery['invitee'] = invitee;

    const chatRequests = await this.chatReqModel
      .find({ ...dataQuery })
      .populate('inviter', '_id firstName lastName')
      .populate('invitee', '_id firstName lastName')
      .sort(sortQuery)
      .skip(+offset)
      .limit(+limit)
      .exec();

    this.logger.log(`FindAll: fetched chat requests successfully`);
    return chatRequests;
  }
}
