import {
  BadRequestException,
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
import { StorageService } from '../../rest/storage/services/storage.service'

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
  ) {}

  async findAll() {
    this.logger.log('Searching for all products')
    const products = await this.productRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.category', 'category')
      .where('product.isDeleted = :isDeleted', { isDeleted: false })
      .orderBy('product.id', 'ASC')
      .getMany()
    return products.map((product) => this.productMapper.toDto(product))
  }

  async findOne(id: string) {
    this.logger.log(`Searching for product with id: ${id}`)
    const products = await this.productRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.category', 'category')
      .where('product.id = :id', { id })
      .getOne()
    if (!products) {
      throw new NotFoundException(`Product with id: ${id} not found`)
    } else {
      return this.productMapper.toDto(products)
    }
  }

  async create(createProductDto: CreateProductDto) {
    this.logger.log('Product created')
    const category: Category = await this.checkCategory(
      createProductDto.category,
    )
    const product = this.productMapper.toEntity(createProductDto, category)
    const productCreated = await this.productRepository.save(product)
    return this.productMapper.toDto(productCreated)
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
    return this.productMapper.toDto(productUpdated)
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
    await this.productRepository.remove(products)
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
    return this.productMapper.toDto(productDeleted)
  }

  async updateImage(id: string, file: Express.Multer.File) {
    this.logger.log(`Updating funko image with id ${id}`)
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
}
