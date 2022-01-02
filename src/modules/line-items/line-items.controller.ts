import { Controller, Post, Body, Logger, Get, Query, Param, Patch, Delete, UseGuards } from '@nestjs/common';
import { LineItemsService } from './line-items.service';
import { CreateLineItemDto, LineItemQueryDto } from './dto/create-line-item.dto';
import { UpdateLineItemDto } from './dto/update-line-item.dto';
import { ResponseError, ResponseSuccess } from 'src/common/dto/response.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller({
  path: '/line-items',
  version: '1.0.0'
})
export class LineItemsController {
  private logger: Logger;

  constructor(private readonly lineItemsService: LineItemsService) {
    this.logger = new Logger(LineItemsController.name);
  }

  @Post()
  @UseGuards(AuthGuard('jwt'))
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
  @UseGuards(AuthGuard('jwt'))
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
  @UseGuards(AuthGuard('jwt'))
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
  @UseGuards(AuthGuard('jwt'))
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
  @UseGuards(AuthGuard('jwt'))
  async remove(@Param('lineItemId') lineItemId: string) {
    try {
      const removedItem = await await this.lineItemsService.remove(lineItemId);

      if (removedItem && removedItem?._id) {
        return new ResponseSuccess('LINE_ITEM.DELETE', removedItem);
      } else {
        return new ResponseError('LINE_ITEM.ERROR.DELETE_LINE_ITEM_FAILED');
      }
    } catch (error) {
      this.logger.error('Error: ', error);
      return new ResponseError('LINE_ITEM.ERROR.DELETE_LINE_ITEM_FAILED', error);
    }
  }
}
