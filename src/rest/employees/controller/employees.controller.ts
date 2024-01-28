import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  HttpCode,
  Put,
} from '@nestjs/common'
import { EmployeesService } from '../services/employees.service'
import { CreateEmployeeDto } from '../dto/create-employee.dto'
import { UpdateEmployeeDto } from '../dto/update-employee.dto'
import { Paginate, PaginateQuery } from 'nestjs-paginate'

@Controller('employees')
export class EmployeesController {
  constructor(private readonly employeesService: EmployeesService) {}

  @HttpCode(201)
  @Post()
  create(@Body() createEmployeeDto: CreateEmployeeDto) {
    return this.employeesService.create(createEmployeeDto)
  }

  @Get()
  findAll(@Paginate() query: PaginateQuery) {
    return this.employeesService.findAll(query)
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.employeesService.findOne(id)
  }

  @Put(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateEmployeeDto: UpdateEmployeeDto,
  ) {
    return this.employeesService.update(id, updateEmployeeDto)
  }

  @HttpCode(204)
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.employeesService.remove(id)
  }
}
