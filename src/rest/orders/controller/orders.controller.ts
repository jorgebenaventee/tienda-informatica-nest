import {
  Body,
  Controller,
  DefaultValuePipe,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
} from '@nestjs/common'
import { OrdersService } from '../services/orders.service'
import { CreateOrderDto } from '../dto/create-order.dto'
import { UpdateOrderDto } from '../dto/update-order.dto'
import { IdValidatePipe } from '../pipes/id-validate.pipe'
import { OrderByValidatePipe } from '../pipes/orderby-validate.pipe'
import { OrderValidatePipe } from '../pipes/order-validate.pipe'
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiExcludeController,
  ApiNotFoundResponse,
  ApiParam,
  ApiQuery,
  ApiResponse,
} from '@nestjs/swagger'
import { Roles } from '../../auth/roles/roles.guard'

@Controller('orders')
@ApiExcludeController()
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get()
  @ApiResponse({ status: 200, description: 'Get all orders' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @Roles('client')
  async findAll(
    @Query('page', new DefaultValuePipe(1)) page: number = 1,
    @Query('limit', new DefaultValuePipe(20)) limit: number = 20,
    @Query('orderBy', new DefaultValuePipe('userId'), OrderByValidatePipe)
    orderBy: string = 'userId',
    @Query('order', new DefaultValuePipe('asc'), OrderValidatePipe)
    order: string,
  ) {
    return await this.ordersService.findAll(page, limit, orderBy, order)
  }

  @Get(':id')
  @Roles('employee')
  @ApiResponse({ status: 200, description: 'Get order by id' })
  @ApiParam({ name: 'id', required: true, type: String })
  @ApiBadRequestResponse({ description: 'Id must be a uuid' })
  @ApiNotFoundResponse({ description: 'Order not found' })
  async findOne(@Param('id', IdValidatePipe) id: string) {
    return await this.ordersService.findOne(id)
  }

  @Get('user/:userId')
  @Roles('employee')
  @ApiResponse({ status: 200, description: 'Get order by user id' })
  @ApiParam({ name: 'userId', required: true, type: Number })
  @ApiBadRequestResponse({ description: 'User id must be a number' })
  @ApiNotFoundResponse({ description: 'Order not found by user id' })
  async findByUserId(@Param('userId', ParseIntPipe) userId: number) {
    return await this.ordersService.findByUserId(userId)
  }

  @Post()
  @HttpCode(201)
  @Roles('employee')
  @ApiResponse({ status: 201, description: 'Create order' })
  @ApiBadRequestResponse({ description: 'Invalid data' })
  @ApiBody({ type: CreateOrderDto })
  async create(@Body() createOrderDto: CreateOrderDto) {
    return await this.ordersService.create(createOrderDto)
  }

  @Put(':id')
  @Roles('employee')
  @HttpCode(201)
  @ApiResponse({ status: 201, description: 'Update order' })
  @ApiBadRequestResponse({ description: 'Invalid data' })
  @ApiNotFoundResponse({ description: 'Order not found' })
  @ApiParam({ name: 'id', required: true, type: String })
  @ApiBody({ type: UpdateOrderDto })
  async update(
    @Param('id', IdValidatePipe) id: string,
    @Body() updateOrderDto: UpdateOrderDto,
  ) {
    return await this.ordersService.update(id, updateOrderDto)
  }

  @Delete(':id')
  @ApiResponse({ status: 204, description: 'Delete order' })
  @ApiBadRequestResponse({ description: 'Id must be a uuid' })
  @ApiNotFoundResponse({ description: 'Order not found' })
  @ApiParam({ name: 'id', required: true, type: String })
  @Roles('employee')
  @HttpCode(204)
  async remove(@Param('id', IdValidatePipe) id: string) {
    await this.ordersService.remove(id)
  }
}
