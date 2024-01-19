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
  UseInterceptors,
} from '@nestjs/common'
import { SuppliersService } from '../services/suppliers.service'
import { CreateSupplierDto } from '../dto/create-supplier.dto'
import { UpdateSupplierDto } from '../dto/update-supplier.dto'
import { CacheInterceptor, CacheKey, CacheTTL } from '@nestjs/cache-manager'
import { Paginate, PaginateQuery } from 'nestjs-paginate'
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiExcludeEndpoint,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger'

@Controller('suppliers')
@ApiTags('Suppliers')
@UseInterceptors(CacheInterceptor)
export class SuppliersController {
  constructor(private readonly suppliersService: SuppliersService) {}

  @Get()
  @CacheKey('all_suppliers')
  @CacheTTL(60)
  @ApiExcludeEndpoint()
  findAll(@Paginate() query: PaginateQuery) {
    return this.suppliersService.findAll(query)
  }

  @Get(':id')
  @CacheKey('supplierById')
  @CacheTTL(60)
  @ApiExcludeEndpoint()
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.suppliersService.findOne(id)
  }

  @Post()
  @HttpCode(201)
  @ApiResponse({
    status: 201,
    description: 'The record has been successfully created.',
    type: CreateSupplierDto,
  })
  @ApiBody({ type: CreateSupplierDto })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  create(@Body() createSupplierDto: CreateSupplierDto) {
    return this.suppliersService.create(createSupplierDto)
  }

  @Put(':id')
  @HttpCode(201)
  @ApiExcludeEndpoint()
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateSupplierDto: UpdateSupplierDto,
  ) {
    return this.suppliersService.update(id, updateSupplierDto)
  }

  @Delete(':id')
  @HttpCode(204)
  @ApiExcludeEndpoint()
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.suppliersService.remove(id)
  }
}
