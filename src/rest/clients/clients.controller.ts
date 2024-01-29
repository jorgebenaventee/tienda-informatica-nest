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
import { Paginate, PaginateQuery } from 'nestjs-paginate'
import { JwtAuthGuard } from '../auth/jwt-auth/jwt-auth.guard'
import { Roles, RolesGuard } from '../auth/roles/roles.guard'

@Controller('clients')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ClientsController {
  constructor(private readonly clientsService: ClientsService) {}

  @Post()
  @Roles('employee')
  create(@Body() createClientDto: CreateClientDto) {
    if (Object.keys(createClientDto).length === 0) {
      throw new BadRequestException('Cannot create an empty client')
    }
    return this.clientsService.create(createClientDto)
  }

  @Get()
  @Roles('client')
  async findAll(@Paginate() query: PaginateQuery) {
    return await this.clientsService.findAll(query)
  }

  @Get(':id')
  @Roles('client')
  async findOne(@Param('id', ParseIntPipe) id: string) {
    return await this.clientsService.findOne(+id)
  }

  @Patch(':id')
  @Roles('employee')
  async update(
    @Param('id', ParseIntPipe) id: string,
    @Body() updateClientDto: UpdateClientDto,
  ) {
    if (Object.keys(updateClientDto).length === 0) {
      throw new BadRequestException('Cannot update an empty client')
    }
    return await this.clientsService.update(+id, updateClientDto)
  }

  @Delete(':id')
  @HttpCode(204)
  @Roles('employee')
  async remove(@Param('id') id: string) {
    return await this.clientsService.remove(+id)
  }
}
