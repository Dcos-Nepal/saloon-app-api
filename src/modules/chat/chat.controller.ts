import { BadRequestException, Body, Controller, Get, Logger, Param, Post, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { isValidObjectId } from 'mongoose';
import { CurrentUser } from 'src/common/decorators/current-user';
import { Roles } from 'src/common/decorators/roles.decorator';
import { ResponseError, ResponseSuccess } from 'src/common/dto/response.dto';
import { RolesGuard } from '../auth/guards/roles.guard';
import { NotificationPayload, UserDeviceService } from '../devices/devices.service';
import { User } from '../users/interfaces/user.interface';
import { ChatMessageService } from './chat-message.service';
import { ChatRequestService } from './chat-request.service';
import { ChatRoomService } from './chat-room.service';
import { ChatMessageDto, ChatMessageQueryDto } from './dto/chat-message.dto';
import { ChatRequestDto, ChatRequestQueryDto } from './dto/chat-request.dto';
import { ChatRoomDto, ChatRoomQueryDto } from './dto/chat-room.dto';

@Controller({
  path: '/chat',
  version: '1'
})
@UseGuards(AuthGuard('jwt'))
export class ChatController {
  private logger: Logger;

  constructor(
    private readonly deviceService: UserDeviceService,
    private readonly chatRoomService: ChatRoomService,
    private readonly chatRequestService: ChatRequestService,
    private readonly chatMessageService: ChatMessageService
  ) {
    this.logger = new Logger(ChatController.name);
  }

  @Post('/requests')
  @Roles('CLIENT')
  @UseGuards(RolesGuard)
  async requestForChat(@CurrentUser() authUser: User, @Body() chatReqDto: ChatRequestDto) {
    try {
      const chatRequest = await this.chatRequestService.createChatRequest(authUser, chatReqDto);

      if (chatRequest) {
        // Notify Worker via Push Notification:
        const notificationPayload: NotificationPayload = {
          notification: {
            title: 'Chat Request Received!',
            body: `You're invited for a chat request by a client`
          },
          mobileData: {
            type: 'CHAT_REQUEST_RECEIVED',
            routeName: '/chat-requests',
            metaData: '',
            click_action: 'APP_NOTIFICATION_CLICK'
          }
        };
        this.deviceService.sendNotification(chatRequest.invitee as string, notificationPayload);

        return new ResponseSuccess('CHAT.REQUEST', chatRequest);
      } else {
        return new ResponseError('CHAT.ERROR.CREATE_REQUEST_FAILED');
      }
    } catch (error) {
      if (error instanceof BadRequestException) {
        return new ResponseSuccess('CHAT.REQUEST_ALREADY_EXISTS', "You've already sent a request to this user");
      }

      this.logger.error('Error: ', error);
      return new ResponseError('CHAT.ERROR.CREATE_REQUEST_FAILED', error);
    }
  }

  @Get('/requests')
  @Roles('ADMIN', 'WORKER', 'CLIENT')
  @UseGuards(RolesGuard)
  async getChatRequests(@Query() query: ChatRequestQueryDto) {
    try {
      const chatRequests = await this.chatRequestService.fetchChatRequests(query);

      if (chatRequests) {
        return new ResponseSuccess('CHAT.REQUESTS', chatRequests);
      } else {
        return new ResponseError('CHAT.ERROR.FETCH_REQUESTS_FAILED');
      }
    } catch (error) {
      this.logger.error('Error: ', error);
      return new ResponseError('CHAT.ERROR.FETCH_REQUESTS_FAILED', error);
    }
  }

  @Get('/requests/:requestId/accept')
  @Roles('WORKER')
  @UseGuards(RolesGuard)
  async acceptChatRequest(@CurrentUser() authUser: User, @Param('requestId') requestId: string) {
    try {
      const chatRequest = await this.chatRequestService.acceptChatRequest(authUser, requestId);

      if (chatRequest) {
        // Notify Worker via Push Notification:
        const notificationPayload: NotificationPayload = {
          notification: {
            title: 'Chat Request Accepted!',
            body: `Your Chat request is accepted by a Worker.`
          },
          mobileData: {
            type: 'CHAT_REQUEST_ACCEPTED',
            routeName: '/chat-requests',
            metaData: '',
            click_action: 'APP_NOTIFICATION_CLICK'
          }
        };
        this.deviceService.sendNotification(chatRequest.inviter as string, notificationPayload);

        return new ResponseSuccess('CHAT.REQUESTS', { isAccepted: chatRequest });
      } else {
        return new ResponseError('CHAT.ERROR.FETCH_REQUESTS_FAILED');
      }
    } catch (error) {
      this.logger.error('Error: ', error);
      return new ResponseError('CHAT.ERROR.FETCH_REQUESTS_FAILED', error);
    }
  }

  @Get('/requests/:id/reject')
  @Roles('WORKER')
  @UseGuards(RolesGuard)
  rejectChatRequest() {
    // TODO
  }

  @Get('/rooms')
  @Roles('ADMIN', 'WORKER', 'CLIENT')
  @UseGuards(RolesGuard)
  async getUserChatRooms(@Query() query: ChatRoomQueryDto) {
    try {
      const chatRooms = await this.chatRoomService.fetchChatRooms(query);

      if (chatRooms) {
        return new ResponseSuccess('CHAT.ROOMS', chatRooms);
      } else {
        return new ResponseError('CHAT.ERROR.FETCH_ROOMS_FAILED');
      }
    } catch (error) {
      this.logger.error('Error: ', error);
      return new ResponseError('CHAT.ERROR.FETCH_ROOMS_FAILED', error);
    }
  }

  @Post('/rooms')
  @Roles('WORKER', 'CLIENT')
  @UseGuards(RolesGuard)
  async createUserChatRoom(@Query() createRoomDto: ChatRoomDto) {
    try {
      const chatRoom = await this.chatRoomService.createRoom(createRoomDto);

      if (chatRoom) {
        return new ResponseSuccess('CHAT.ROOM', chatRoom);
      } else {
        return new ResponseError('CHAT.ERROR.FETCH_ROOM_FAILED');
      }
    } catch (error) {
      this.logger.error('Error: ', error);
      return new ResponseError('CHAT.ERROR.FETCH_ROOM_FAILED', error);
    }
  }

  @Post('/rooms/:roomId/messages')
  @Roles('ADMIN', 'WORKER', 'CLIENT')
  @UseGuards(RolesGuard)
  async sendChatMessage(@CurrentUser() authUser: User, @Param('roomId') roomId: string, @Body() createMessageDto: ChatMessageDto) {
    if (!isValidObjectId(roomId)) {
      return new ResponseError('CHAT.ERROR.SEND_MESSAGE', 'Invalid Room ID provided.');
    }

    try {
      const chatMessage = await this.chatMessageService.createChatMessage(authUser, roomId, createMessageDto);

      if (chatMessage) {
        return new ResponseSuccess('CHAT.MESSAGE', chatMessage);
      } else {
        return new ResponseError('CHAT.ERROR.CREATE_MESSAGE_FAILED');
      }
    } catch (error) {
      this.logger.error('Error: ', error);
      return new ResponseError('CHAT.ERROR.CREATE_MESSAGE_FAILED', error);
    }
  }

  @Get('/rooms/:roomId/messages')
  @Roles('ADMIN', 'WORKER', 'CLIENT')
  @UseGuards(RolesGuard)
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
      this.logger.error('Error: ', error);
      return new ResponseError('CHAT.ERROR.CREATE_MESSAGE_FAILED', error);
    }
  }
}
