import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common'
import { ClientsService } from './clients.service'
import { CreateClientDto } from './dto/create-client.dto'
import { UpdateClientDto } from './dto/update-client.dto'
import { Paginate, PaginateQuery, Paginated } from 'nestjs-paginate'
import { JwtAuthGuard } from '../auth/jwt-auth/jwt-auth.guard'
import { Roles, RolesGuard } from '../auth/roles/roles.guard'
import { ApiBadRequestResponse, ApiBody, ApiNotFoundResponse, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger'
import { ClientResponseDto } from './dto/client-response.dto'

@ApiTags('clients')
@Controller('clients')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ClientsController {
  constructor(private readonly clientsService: ClientsService) {}

  @Post()
  @Roles('employee')
  @ApiBody({ type: CreateClientDto, description: 'Client to create' }) 
  @ApiResponse({
    status: 201,
    description: 'Client created successfully',
    type: ClientResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Bad request',
  })
  create(@Body() createClientDto: CreateClientDto) {
    if (Object.keys(createClientDto).length === 0) {
      throw new BadRequestException('Cannot create an empty client');
    }
    return this.clientsService.create(createClientDto);
  }

  @Get()
  @Roles('client')
  @ApiResponse({
    status: 200,
    description: 'List of clients paginated',
    type: Paginated<ClientResponseDto>,
  })
  @ApiQuery({
    description: 'Filter by limit',
    name: 'limit',
    required: false,
    type: Number,
  })
  @ApiQuery({
    description: 'Filter by page',
    name: 'page',
    required: false,
    type: Number,
  })
  @ApiQuery({
    description: 'Filter by sort, ASC or DESC',
    name: 'sortBy',
    required: false,
    type: String,
  })
  async findAll(@Paginate() query: PaginateQuery) {
    return await this.clientsService.findAll(query);
  }

  @Get(':id')
  @Roles('client')
  @ApiResponse({
    status: 200,
    description: 'Return a client by id',
    type: ClientResponseDto,
  })
  @ApiParam({
    name: 'id',
    description: 'Client id',
    type: Number,
  })
  @ApiNotFoundResponse({
    description: 'Client not found',
  })
  @ApiBadRequestResponse({
    description: 'Invalid client id',
  })
  async findOne(@Param('id', ParseIntPipe) id: string) {
    return await this.clientsService.findOne(+id);
  }

  @Patch(':id')
  @Roles('employee')
  @ApiBody({ type: UpdateClientDto, description: 'Client to update' }) 
  @ApiResponse({
    status: 200,
    description: 'Client updated successfully',
    type: ClientResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Client not found',
  })
  async update(
    @Param('id', ParseIntPipe) id: string,
    @Body() updateClientDto: UpdateClientDto,
  ) {
    if (Object.keys(updateClientDto).length === 0) {
      throw new BadRequestException('Cannot update an empty client');
    }
    return await this.clientsService.update(+id, updateClientDto);
  }

  @Delete(':id')
  @HttpCode(204)
  @Roles('employee')
  @ApiResponse({
    status: 204,
    description: 'Client deleted successfully',
  })
  @ApiNotFoundResponse({
    description: 'Client not found',
  })
  async remove(@Param('id') id: string) {
    return await this.clientsService.remove(+id);
  }
}
