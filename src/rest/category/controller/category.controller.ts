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
import { CategoryService } from '../services/category.service'
import { CreateCategoryDto } from '../dto/create-category.dto'
import { UpdateCategoryDto } from '../dto/update-category.dto'
import { CacheInterceptor, CacheKey, CacheTTL } from '@nestjs/cache-manager'
import { Paginate, PaginateQuery } from 'nestjs-paginate'
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiExcludeEndpoint,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger'

@UseInterceptors(CacheInterceptor)
@ApiTags('Category')
@Controller('category')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Get()
  @CacheKey('all_categories')
  @CacheTTL(60)
  @ApiExcludeEndpoint()
  async findAll(@Paginate() query: PaginateQuery) {
    return await this.categoryService.findAll(query)
  }

  @Get(':id')
  @CacheKey('one_category')
  @CacheTTL(60)
  @ApiExcludeEndpoint()
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return await this.categoryService.findOne(id)
  }

  @Post()
  @HttpCode(201)
  @ApiResponse({
    status: 201,
    description: 'Category created',
  })
  @ApiBody({
    type: CreateCategoryDto,
  })
  @ApiBadRequestResponse({
    description: 'Category already exists',
  })
  async create(@Body() createCategoryDto: CreateCategoryDto) {
    return await this.categoryService.create(createCategoryDto)
  }

  @Put(':id')
  @ApiExcludeEndpoint()
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ) {
    return await this.categoryService.update(id, updateCategoryDto)
  }

  @Delete(':id')
  @ApiExcludeEndpoint()
  @HttpCode(204)
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    //return await this.categoryService.remove(id)
    return await this.categoryService.removeSoft(id)
  }
}
