import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  HttpCode,
  Put,
  UseInterceptors,
  Patch,
  Post,
} from '@nestjs/common'
import { EmployeesService } from '../services/employees.service'
import { CreateEmployeeDto } from '../dto/create-employee.dto'
import { UpdateEmployeeDto } from '../dto/update-employee.dto'
import { Paginate, Paginated, PaginateQuery } from 'nestjs-paginate'
import { CacheInterceptor } from '@nestjs/cache-manager'
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiNotFoundResponse,
  ApiParam,
  ApiQuery,
  ApiResponse,
} from '@nestjs/swagger'
import { ResponseEmployeeDto } from '../dto/response-employee.dto'
import { IsNotEmptyObject } from 'class-validator'
import { EmptyObjectInterceptor } from '../interceptors/EmptyObjetInterceptor'

@UseInterceptors(CacheInterceptor)
@Controller('employees')
export class EmployeesController {
  constructor(private readonly employeesService: EmployeesService) {}

  @HttpCode(201)
  @Post()
  @ApiBearerAuth()
  @ApiResponse({
    status: 201,
    description: 'Employee created',
    type: ResponseEmployeeDto,
  })
  @ApiBody({
    description: 'Employee data to create',
    type: CreateEmployeeDto,
  })
  @ApiBadRequestResponse({
    description:
      'Some of the fields are not valid according to the DTO specification',
  })
  @ApiBadRequestResponse({
    description: 'Employee does not have a valid fields',
  })
  create(@Body() createEmployeeDto: CreateEmployeeDto) {
    return this.employeesService.create(createEmployeeDto)
  }

  @Get()
  @ApiResponse({
    status: 200,
    description: 'List of employees paginated, sorted and filtered by search',
    type: Paginated<ResponseEmployeeDto>,
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
    description: 'Filter by order: campo:ASC|DESC',
    name: 'sortBy',
    required: false,
    type: String,
  })
  @ApiQuery({
    description: 'Filter by search: filter.campo = $eq:value',
    name: 'filter',
    required: false,
    type: String,
  })
  @ApiQuery({
    description: 'Filter by search: search = value',
    name: 'search',
    required: false,
    type: String,
  })
  findAll(@Paginate() query: PaginateQuery) {
    return this.employeesService.findAll(query)
  }

  @Get(':id')
  @ApiResponse({
    status: 200,
    description: 'Employee found',
    type: ResponseEmployeeDto,
  })
  @ApiParam({
    name: 'id',
    description: 'Employee identifier',
    type: Number,
  })
  @ApiNotFoundResponse({
    description: 'Employee not found',
  })
  @ApiBadRequestResponse({
    description: 'Employee id is not valid',
  })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.employeesService.findOne(id)
  }

  @Put(':id')
  @ApiBearerAuth()
  @ApiResponse({
    status: 200,
    description: 'Employee updated',
    type: ResponseEmployeeDto,
  })
  @ApiParam({
    name: 'id',
    description: 'Employee identifier',
    type: Number,
  })
  @ApiBody({
    description: 'Employee data to update',
    type: UpdateEmployeeDto,
  })
  @ApiNotFoundResponse({
    description: 'Employee not found',
  })
  @ApiBadRequestResponse({
    description:
      'Some of the fields are not valid according to the DTO specification',
  })
  @ApiBadRequestResponse({
    description: 'Employee does not have a valid fields',
  })
  @UseInterceptors(EmptyObjectInterceptor)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateEmployeeDto: UpdateEmployeeDto,
  ) {
    return this.employeesService.update(id, updateEmployeeDto)
  }

  @HttpCode(204)
  @Delete(':id')
  @ApiBearerAuth()
  @ApiResponse({
    status: 204,
    description: 'Employee deleted',
  })
  @ApiParam({
    name: 'id',
    description: 'Employee identifier',
    type: Number,
  })
  @ApiNotFoundResponse({
    description: 'Employee not found',
  })
  @ApiBadRequestResponse({
    description: 'Employee id is not valid',
  })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.employeesService.remove(id)
  }
}
