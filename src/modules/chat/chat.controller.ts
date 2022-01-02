import { Body, Controller, Get, Logger, Param, Post, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { isValidObjectId } from 'mongoose';
import { CurrentUser } from 'src/common/decorators/current-user';
import { ResponseError, ResponseSuccess } from 'src/common/dto/response.dto';
import { User } from '../users/interfaces/user.interface';
import { ChatMessageService } from './chat-message.service';
import { ChatRequestService } from './chat-request.service';
import { ChatRoomService } from './chat-room.service';
import { ChatMessageDto, ChatMessageQueryDto } from './dto/chat-message.dto';
import { ChatRequestDto, ChatRequestQueryDto } from './dto/chat-request.dto';
import { ChatRoomDto } from './dto/chat-room.dto';

@Controller({
  path: '/chat',
  version: '1.0.0'
})
export class ChatController {
  private logger: Logger;

  constructor(
    private readonly chatRoomService: ChatRoomService,
    private readonly chatRequestService: ChatRequestService,
    private readonly chatMessageService: ChatMessageService
  ) {
    this.logger = new Logger(ChatController.name);
  }

  @Post('/requests')
  @UseGuards(AuthGuard('jwt'))
  async requestForChat(@CurrentUser() authUser: User, @Body() chatReqDto: ChatRequestDto) {
    try {
      const chatRequest = await this.chatRequestService.createChatRequest(authUser, chatReqDto);

      if (chatRequest) {
        return new ResponseSuccess('CHAT.REQUEST', chatRequest);
      } else {
        return new ResponseError('CHAT.ERROR.CREATE_REQUEST_FAILED');
      }
    } catch (error) {
      this.logger.error('Error: ', error);
      return new ResponseError('CHAT.ERROR.CREATE_REQUEST_FAILED', error);
    }
  }

  @Get('/requests')
  @UseGuards(AuthGuard('jwt'))
  async getChatRequests(@Query() query: ChatRequestQueryDto) {
    try {
      const chatRequests = await this.chatRequestService.ferchChatRequests(query);

      if (chatRequests) {
        return new ResponseSuccess('CHAT.REQUESTS', chatRequests);
      } else {
        return new ResponseError('CHAT.ERROR.FETCH_REQUESTS_FAILED');
      }
    } catch (error) {
      // this.logger.error('Error: ', error);
      return new ResponseError('CHAT.ERROR.FETCH_REQUESTS_FAILED', error);
    }
  }

  @Get('/requests/:requestId/accept')
  @UseGuards(AuthGuard('jwt'))
  async acceptChatRequest(@CurrentUser() authUser: User, @Param('requestId') requestId: string) {
    try {
      const isAccepted = await this.chatRequestService.acceptChatRequest(authUser, requestId);

      if (isAccepted) {
        return new ResponseSuccess('CHAT.REQUESTS', { isAccepted: isAccepted });
      } else {
        return new ResponseError('CHAT.ERROR.FETCH_REQUESTS_FAILED');
      }
    } catch (error) {
      // this.logger.error('Error: ', error);
      return new ResponseError('CHAT.ERROR.FETCH_REQUESTS_FAILED', error);
    }
  }

  @Get('/requests/:id/reject')
  @UseGuards(AuthGuard('jwt'))
  rejectChatRequest() {
    // TODO
  }

  @Get('/rooms')
  @UseGuards(AuthGuard('jwt'))
  async getUserChatRooms(@Query() query: ChatRequestQueryDto) {
    try {
      const chatRooms = await this.chatRoomService.fetchChatRooms(query);

      if (chatRooms) {
        return new ResponseSuccess('CHAT.ROOMS', chatRooms);
      } else {
        return new ResponseError('CHAT.ERROR.FETCH_ROOMS_FAILED');
      }
    } catch (error) {
      // this.logger.error('Error: ', error);
      return new ResponseError('CHAT.ERROR.FETCH_ROOMS_FAILED', error);
    }
  }

  @Post('/rooms')
  @UseGuards(AuthGuard('jwt'))
  async createUserChatRoom(@Query() createRoomDto: ChatRoomDto) {
    try {
      const chatRoom = await this.chatRoomService.createRoom(createRoomDto);

      if (chatRoom) {
        return new ResponseSuccess('CHAT.ROOM', chatRoom);
      } else {
        return new ResponseError('CHAT.ERROR.FETCH_ROOM_FAILED');
      }
    } catch (error) {
      // this.logger.error('Error: ', error);
      return new ResponseError('CHAT.ERROR.FETCH_ROOM_FAILED', error);
    }
  }

  @Post('/rooms/:roomId/messages')
  @UseGuards(AuthGuard('jwt'))
  async sendChatMessage(@CurrentUser() authUser: User, @Param('roomId') roomId: string, @Body() createMessgeDto: ChatMessageDto) {
    if (!isValidObjectId(roomId)) {
      return new ResponseError('CHAT.ERROR.SEND_MESSAGE', 'Invalid Room ID provided.');
    }

    try {
      const chatMessage = await this.chatMessageService.createChatMessage(authUser, roomId, createMessgeDto);

      if (chatMessage) {
        return new ResponseSuccess('CHAT.MESSAGE', chatMessage);
      } else {
        return new ResponseError('CHAT.ERROR.CREATE_MESSAGE_FAILED');
      }
    } catch (error) {
      // this.logger.error('Error: ', error);
      return new ResponseError('CHAT.ERROR.CREATE_MESSAGE_FAILED', error);
    }
  }

  @Get('/rooms/:roomId/messages')
  @UseGuards(AuthGuard('jwt'))
  async getChatMessages(@Param('roomId') roomId: string, @Query() query: ChatMessageQueryDto) {
    if (!isValidObjectId(roomId)) {
      return new ResponseError('CHAT.ERROR.SEND_MESSAGE', 'Invalid Room ID provided.');
    }

    try {
      const chatMessage = await this.chatMessageService.filterChatMessages(roomId, query);

      if (chatMessage) {
        return new ResponseSuccess('CHAT.MESSAGE', chatMessage);
      } else {
        return new ResponseError('CHAT.ERROR.CREATE_MESSAGE_FAILED');
      }
    } catch (error) {
      // this.logger.error('Error: ', error);
      return new ResponseError('CHAT.ERROR.CREATE_MESSAGE_FAILED', error);
    }
  }
}
