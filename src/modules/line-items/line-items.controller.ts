import { Controller, Post, Body, Logger, Get, Query, Param, Patch, Delete, UseGuards } from '@nestjs/common';
import { LineItemsService } from './line-items.service';
import { CreateLineItemDto, LineItemQueryDto } from './dto/create-line-item.dto';
import { UpdateLineItemDto } from './dto/update-line-item.dto';
import { ResponseError, ResponseSuccess } from 'src/common/dto/response.dto';
import { AuthGuard } from '@nestjs/passport';
import { InjectConnection } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.decorator';

@Controller({
  path: '/line-items',
  version: '1.0.0'
})
@UseGuards(AuthGuard('jwt'))
export class LineItemsController {
  private logger: Logger;

  constructor(private readonly lineItemsService: LineItemsService, @InjectConnection() private readonly connection: mongoose.Connection) {
    this.logger = new Logger(LineItemsController.name);
  }

  @Post()
  @Roles('ADMIN')
  @UseGuards(RolesGuard)
  async create(@Body() createLineItemDto: CreateLineItemDto) {
    try {
      const lineItem = await this.lineItemsService.create(createLineItemDto);

      if (lineItem) {
        return new ResponseSuccess('LINE_ITEM.CREATE', lineItem);
      } else {
        return new ResponseError('LINE_ITEM.ERROR.CREATE_LINE_ITEM_FAILED');
      }
    } catch (error) {
      this.logger.error('Error: ', error);
      return new ResponseError('LINE_ITEM.ERROR.CREATE_LINE_ITEM_FAILED', error);
    }
  }

  @Get()
  async findAll(@Query() query: LineItemQueryDto) {
    try {
      const lineItems = await this.lineItemsService.filterLineItems(query);

      if (lineItems) {
        return new ResponseSuccess('LINE_ITEM.FILTER', lineItems);
      } else {
        return new ResponseError('LINE_ITEM.ERROR.FILTER_LINE_ITEM_FAILED');
      }
    } catch (error) {
      this.logger.error('Error: ', error);
      return new ResponseError('LINE_ITEM.ERROR.FILTER_LINE_ITEM_FAILED', error);
    }
  }

  @Get('/:lineItemId')
  async findOne(@Param('lineItemId') lineItemId: string) {
    try {
      const lineItem = await this.lineItemsService.findOne({ _id: lineItemId });

      if (lineItem) {
        return new ResponseSuccess('LINE_ITEM.FIND', lineItem);
      } else {
        return new ResponseError('LINE_ITEM.ERROR.FIND_LINE_ITEM_FAILED');
      }
    } catch (error) {
      this.logger.error('Error: ', error);
      return new ResponseError('LINE_ITEM.ERROR.FIND_LINE_ITEM_FAILED', error);
    }
  }

  @Patch('/:lineItemId')
  @Roles('ADMIN')
  @UseGuards(RolesGuard)
  async update(@Param('lineItemId') lineItemId: string, @Body() updateLineItemDto: UpdateLineItemDto) {
    try {
      const lineItem = await this.lineItemsService.update(lineItemId, updateLineItemDto);

      if (lineItem) {
        return new ResponseSuccess('LINE_ITEM.UPDATE', lineItem);
      } else {
        return new ResponseError('LINE_ITEM.ERROR.UPDATE_LINE_ITEM_FAILED');
      }
    } catch (error) {
      this.logger.error('Error: ', error);
      return new ResponseError('LINE_ITEM.ERROR.UPDATE_LINE_ITEM_FAILED', error);
    }
  }

  @Delete('/:lineItemId')
  @Roles('ADMIN')
  @UseGuards(RolesGuard)
  async remove(@Param('lineItemId') lineItemId: string) {
    try {
      const session = await this.connection.startSession();
      let removedItem: boolean;
      await session.withTransaction(async () => {
        removedItem = await this.lineItemsService.remove(lineItemId, session);
      });
      return new ResponseSuccess('LINE_ITEM.DELETE', removedItem);
    } catch (error) {
      this.logger.error('Error: ', error);
      return new ResponseError('LINE_ITEM.ERROR.DELETE_LINE_ITEM_FAILED', error);
    }
  }
}
