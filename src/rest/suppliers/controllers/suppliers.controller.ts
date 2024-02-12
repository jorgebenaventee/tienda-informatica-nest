import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common'
import { SuppliersService } from '../services/suppliers.service'
import { CreateSupplierDto } from '../dto/create-supplier.dto'
import { UpdateSupplierDto } from '../dto/update-supplier.dto'
import { CacheInterceptor, CacheKey, CacheTTL } from '@nestjs/cache-manager'
import { Paginate, Paginated, PaginateQuery } from 'nestjs-paginate'
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiNotFoundResponse,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger'
import { JwtAuthGuard } from '../../auth/jwt-auth/jwt-auth.guard'
import { Roles, RolesGuard } from '../../auth/roles/roles.guard'

@Controller('suppliers')
@ApiTags('Suppliers')
@UseGuards(JwtAuthGuard, RolesGuard)
@UseInterceptors(CacheInterceptor)
export class SuppliersController {
  constructor(private readonly suppliersService: SuppliersService) {}

  @Get()
  @CacheKey('all_suppliers')
  @Roles('employee')
  @CacheTTL(60)
  @ApiResponse({
    status: 200,
    description: 'List of suppliers paginated, sorted and filtered by search',
    type: Paginated<CreateSupplierDto>,
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
    description: 'Filter by search',
    name: 'search',
    required: false,
    type: String,
  })
  @ApiQuery({
    description: 'Filter by sort, ASC or DESC',
    name: 'sort',
    required: false,
    type: String,
  })
  @ApiQuery({
    description: 'Filter by name, contact, address, is_deleted, category',
    name: 'search',
    required: false,
    type: String,
  })
  findAll(@Paginate() query: PaginateQuery) {
    return this.suppliersService.findAll(query)
  }

  @Get(':id')
  @Roles('employee')
  @CacheKey('supplierById')
  @CacheTTL(60)
  @ApiResponse({
    status: 200,
    description: 'The found record',
    type: CreateSupplierDto,
  })
  @ApiParam({
    name: 'id',
    type: String,
    description: 'The supplier id',
    required: true,
  })
  @ApiNotFoundResponse({ description: 'Not Found' })
  @ApiBadRequestResponse({ description: 'Invalid id' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.suppliersService.findOne(id)
  }

  @Post()
  @Roles('employee')
  @HttpCode(201)
  @ApiResponse({
    status: 201,
    description: 'The record has been successfully created.',
    type: CreateSupplierDto,
  })
  @ApiBody({ type: CreateSupplierDto })
  @ApiBadRequestResponse({ description: 'Invalid id' })
  @ApiBadRequestResponse({ description: 'Category not found' })
  create(@Body() createSupplierDto: CreateSupplierDto) {
    return this.suppliersService.create(createSupplierDto)
  }

  @Put(':id')
  @Roles('employee')
  @HttpCode(201)
  @ApiResponse({
    status: 201,
    description: 'The record has been successfully updated.',
    type: CreateSupplierDto,
  })
  @ApiParam({
    name: 'id',
    type: String,
    description: 'The supplier id',
    required: true,
  })
  @ApiBody({
    description: 'Update supplier data',
    type: UpdateSupplierDto,
  })
  @ApiNotFoundResponse({ description: 'Supplier not found' })
  @ApiBadRequestResponse({ description: 'Invalid id' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateSupplierDto: UpdateSupplierDto,
  ) {
    return this.suppliersService.update(id, updateSupplierDto)
  }

  @Delete(':id')
  @Roles('employee')
  @HttpCode(204)
  @ApiResponse({
    status: 204,
    description: 'The record has been successfully deleted.',
  })
  @ApiParam({
    name: 'id',
    type: String,
    description: 'The supplier id',
    required: true,
  })
  @ApiNotFoundResponse({ description: 'Supplier not found' })
  @ApiBadRequestResponse({ description: 'Invalid id' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.suppliersService.remove(id)
  }
}
