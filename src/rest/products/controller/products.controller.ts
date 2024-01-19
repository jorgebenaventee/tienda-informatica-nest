import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Put,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common'
import { ProductsService } from '../services/products.service'
import { CreateProductDto } from '../dto/create-product.dto'
import { UpdateProductDto } from '../dto/update-product.dto'
import { FileInterceptor } from '@nestjs/platform-express'
import { diskStorage } from 'multer'
import { extname, parse } from 'path'
import { v4 as uuidv4 } from 'uuid'
import { ProductExistsGuard } from '../guards/product-exists-guard'
import { CacheInterceptor, CacheKey, CacheTTL } from '@nestjs/cache-manager'
import { Paginate, Paginated, PaginateQuery } from 'nestjs-paginate'
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiConsumes,
  ApiNotFoundResponse,
  ApiParam,
  ApiProperty,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger'
import { ResponseProductDto } from '../dto/response-product.dto'

@Controller('products')
@UseInterceptors(CacheInterceptor)
@ApiTags('Products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  @CacheKey('all_products')
  @CacheTTL(60)
  @ApiResponse({
    status: 200,
    description:
      'List of products paginated, sorted and filtered by search and filter',
    type: Paginated<ResponseProductDto>,
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
  @ApiQuery({
    description: 'Filter by field, name or price',
    name: 'filter',
    required: false,
    type: String,
  })
  @ApiQuery({
    description: 'Filter by search, name or description',
    name: 'search',
    required: false,
    type: String,
  })
  findAll(@Paginate() query: PaginateQuery) {
    return this.productsService.findAll(query)
  }

  @Get(':id')
  @CacheKey('productById')
  @CacheTTL(60)
  @ApiResponse({
    status: 200,
    description: 'Return a product by id',
    type: ResponseProductDto,
  })
  @ApiParam({
    name: 'id',
    description: 'Product id',
    type: Number,
  })
  @ApiNotFoundResponse({
    description: 'Product not found',
  })
  @ApiBadRequestResponse({
    description: 'Invalid product id',
  })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.productsService.findOne(id)
  }

  @Post()
  @HttpCode(201)
  @ApiResponse({
    status: 201,
    description: 'Product created',
    type: ResponseProductDto,
  })
  @ApiBody({
    description: 'Create product data',
    type: CreateProductDto,
  })
  @ApiBadRequestResponse({
    description:
      'Invalid data, name must be unique, price must be greater than 0, category must exist',
  })
  @ApiBadRequestResponse({
    description: 'Category does not exist',
  })
  create(@Body() createProductDto: CreateProductDto) {
    return this.productsService.create(createProductDto)
  }

  @Put(':id')
  @HttpCode(201)
  @ApiResponse({
    status: 200,
    description: 'Product updated',
    type: ResponseProductDto,
  })
  @ApiParam({
    name: 'id',
    description: 'Product id',
    type: Number,
  })
  @ApiBody({
    description: 'Update product data',
    type: UpdateProductDto,
  })
  @ApiNotFoundResponse({
    description: 'Product not found',
  })
  @ApiBadRequestResponse({
    description:
      'Invalid data, name must be unique, price must be greater than 0, category must exist',
  })
  @ApiBadRequestResponse({
    description: 'Category does not exist',
  })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateProductDto: UpdateProductDto,
  ) {
    return this.productsService.update(id, updateProductDto)
  }

  @Patch(':id/image')
  @HttpCode(201)
  @UseGuards(ProductExistsGuard)
  @ApiResponse({
    status: 200,
    description: 'Image updated',
    type: ResponseProductDto,
  })
  @ApiParam({
    name: 'id',
    description: 'Product id',
    type: Number,
  })
  @ApiProperty({
    name: 'file',
    description: 'Image file',
    type: 'string',
    format: 'binary',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Image file',
    type: FileInterceptor('file'),
  })
  @ApiNotFoundResponse({
    description: 'Product not found',
  })
  @ApiBadRequestResponse({
    description: 'Invalid product id',
  })
  @ApiBadRequestResponse({
    description: 'Invalid file type',
  })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: process.env.UPLOADS_DIR || './storage-dir',
        filename: (req, file, cb) => {
          const { name } = parse(file.originalname)
          const fileName = `${uuidv4()}_${name.replace(/\s/g, '')}`
          const fileExt = extname(file.originalname)
          cb(null, `${fileName}${fileExt}`)
        },
      }),
      fileFilter: (req, file, cb) => {
        const allowedMimes = ['image/jpeg', 'image/png', 'image/gif']
        const maxFileSize = 1024 * 1024
        if (!allowedMimes.includes(file.mimetype)) {
          cb(
            new BadRequestException(
              'File type not allowed. Allowed extensions are jpg, png and gif',
            ),
            false,
          )
        } else if (file.size > maxFileSize) {
          cb(
            new BadRequestException('File size exceeds the limit of 1MB'),
            false,
          )
        } else {
          cb(null, true)
        }
      },
    }),
  )
  updateImage(
    @Param('id', ParseUUIDPipe) id: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.productsService.updateImage(id, file)
  }

  @Delete(':id')
  @HttpCode(204)
  @ApiResponse({
    status: 204,
    description: 'Product deleted',
  })
  @ApiParam({
    name: 'id',
    description: 'Product id',
    type: Number,
  })
  @ApiNotFoundResponse({
    description: 'Product not found',
  })
  @ApiBadRequestResponse({
    description: 'Invalid product id',
  })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.productsService.removeSoft(id)
  }
}
