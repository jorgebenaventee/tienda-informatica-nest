import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common'
import { CreateProductDto } from '../dto/create-product.dto'
import { UpdateProductDto } from '../dto/update-product.dto'
import { ProductMapper } from '../mapper/product-mapper'
import { InjectRepository } from '@nestjs/typeorm'
import { Product } from '../entities/product.entity'
import { Repository } from 'typeorm'
import { Category } from '../../category/entities/category.entity'
import { StorageService } from '../../storage/services/storage.service'
import { Cache } from 'cache-manager'
import { CACHE_MANAGER } from '@nestjs/cache-manager'
import {
  FilterOperator,
  FilterSuffix,
  paginate,
  PaginateQuery,
} from 'nestjs-paginate'
import { hash } from 'typeorm/util/StringUtils'
import { ResponseProductDto } from '../dto/response-product.dto'

@Injectable()
export class ProductsService {
  private logger = new Logger('ProductsService ')

  constructor(
    private readonly storageService: StorageService,
    private readonly productMapper: ProductMapper,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async findAll(query: PaginateQuery) {
    this.logger.log('Searching for all products')
    const cache: ResponseProductDto[] = await this.cacheManager.get(
      `all_products_page_${hash(JSON.stringify(query))}`,
    )
    if (cache) {
      this.logger.log('Products found in cache')
      return cache
    }
    const products = this.productRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.category', 'category')

    const page = await paginate(query, products, {
      sortableColumns: ['name', 'weight', 'price', 'stock'],
      defaultSortBy: [['id', 'ASC']],
      searchableColumns: ['name', 'weight', 'price', 'stock'],
      filterableColumns: {
        name: [FilterOperator.EQ, FilterSuffix.NOT],
        price: [FilterOperator.EQ, FilterSuffix.NOT],
        stock: [FilterOperator.EQ, FilterSuffix.NOT],
        isDeleted: [FilterOperator.EQ, FilterSuffix.NOT],
      },
    })
    const dto = {
      data: (page.data ?? []).map((product) =>
        this.productMapper.toDto(product),
      ),
      meta: page.meta,
      links: page.links,
    }
    await this.cacheManager.set(
      `all_products_page_${hash(JSON.stringify(query))}`,
      dto,
      60,
    )
    return dto
  }

  async findOne(id: string) {
    this.logger.log(`Searching for product with id: ${id}`)
    const cache: ResponseProductDto = await this.cacheManager.get(
      `product_${id}`,
    )
    if (cache) {
      this.logger.log('Product found in cache')
      return cache
    }
    const products = await this.productRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.category', 'category')
      .where('product.id = :id', { id })
      .getOne()
    if (!products) {
      throw new NotFoundException(`Product with id: ${id} not found`)
    } else {
      const dto = this.productMapper.toDto(products)
      await this.cacheManager.set(`product_${id}`, dto, 60)
      return dto
    }
  }

  async create(createProductDto: CreateProductDto) {
    this.logger.log('Product created')
    const category: Category = await this.checkCategory(
      createProductDto.category,
    )
    const product = this.productMapper.toEntity(createProductDto, category)
    const productCreated = await this.productRepository.save(product)
    const dto = this.productMapper.toDto(productCreated)
    await this.invalidateCacheKey('all_products_page_')
    return dto
  }

  async update(id: string, updateProductDto: UpdateProductDto) {
    this.logger.log(`Updating product with id: ${id}`)
    const category: Category = await this.checkCategory(
      updateProductDto.category,
    )
    const product = await this.productRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.category', 'category')
      .where('product.id = :id and product.isDeleted = :isDeleted', {
        id,
        isDeleted: false,
      })
      .getOne()
    if (!product || !category) {
      throw new NotFoundException(
        `Product with id: ${id} or category with name: ${updateProductDto.category} not found`,
      )
    }
    const productUpdated = await this.productRepository.save({
      ...product,
      ...updateProductDto,
      category,
    })
    const dto = this.productMapper.toDto(productUpdated)
    await this.invalidateCacheKey('all_products_page_')
    await this.invalidateCacheKey(`product_${id}`)
    return dto
  }

  async remove(id: string) {
    this.logger.log(`Removing product with id: ${id}`)
    const products = await this.productRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.category', 'category')
      .where('product.id = :id', { id })
      .getOne()
    if (!products) {
      throw new NotFoundException(`Product with id: ${id} not found`)
    }
    if (products.image !== Product.IMAGE_DEFAULT) {
      try {
        this.storageService.removeFile(products.image)
      } catch (error) {
        this.logger.error(error)
      }
    }

    const productDeleted = await this.productRepository.remove(products)
    const dto = this.productMapper.toDto(productDeleted)
    await this.invalidateCacheKey('all_products_page_')
    await this.invalidateCacheKey(`product_${id}`)
    return dto
  }

  async removeSoft(id: string) {
    this.logger.log(`Removing soft product with id: ${id}`)
    const products = await this.productRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.category', 'category')
      .where('product.id = :id', { id })
      .getOne()
    if (!products) {
      throw new NotFoundException(`Product with id: ${id} not found`)
    }
    const productDeleted = await this.productRepository.save({
      ...products,
      isDeleted: true,
    })
    const dto = this.productMapper.toDto(productDeleted)
    await this.invalidateCacheKey('all_products_page_')
    await this.invalidateCacheKey(`product_${id}`)
    return dto
  }

  async updateImage(id: string, file: Express.Multer.File) {
    this.logger.log(`Updating product image with id ${id}`)
    const productToUpdate = await this.productRepository.findOneBy({ id })
    if (!productToUpdate) {
      throw new NotFoundException(`Product #${id} not found`)
    }
    if (!file) {
      throw new BadRequestException('File is required')
    }
    if (productToUpdate.image !== Product.IMAGE_DEFAULT) {
      this.logger.log(`Deleting old image ${productToUpdate.image}`)
      try {
        this.storageService.removeFile(productToUpdate.image)
      } catch (error) {
        this.logger.error(error)
      }
    }

    productToUpdate.image = file.filename
    const productUpdated = await this.productRepository.save(productToUpdate)
    const dto = this.productMapper.toDto(productUpdated)
    await this.invalidateCacheKey('all_products_page_')
    await this.invalidateCacheKey(`product_${id}`)
    return dto
  }

  async checkCategory(nameCategory: string) {
    this.logger.log(`Searching for category with name: ${nameCategory}`)
    const category = await this.categoryRepository
      .createQueryBuilder('category')
      .where('category.name = :name and' + ' category.isActive = :isActive', {
        name: nameCategory,
        isActive: true,
      })
      .getOne()
    if (!category) {
      throw new NotFoundException(
        `Category with name: ${nameCategory} not found`,
      )
    }
    return category
  }

  async invalidateCacheKey(keyPattern: string): Promise<void> {
    const cacheKeys = await this.cacheManager.store.keys()
    const keysToDelete = cacheKeys.filter((key) => key.startsWith(keyPattern))
    const promises = keysToDelete.map((key) => this.cacheManager.del(key))
    await Promise.all(promises)
  }
}
