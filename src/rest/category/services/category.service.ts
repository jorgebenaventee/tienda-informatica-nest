import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common'
import { CreateCategoryDto } from '../dto/create-category.dto'
import { UpdateCategoryDto } from '../dto/update-category.dto'
import { Repository } from 'typeorm'
import { Category } from '../entities/category.entity'
import { InjectRepository } from '@nestjs/typeorm'
import { CategoryMapper } from '../mapper/category-mapper'
import { Cache } from 'cache-manager'
import { CACHE_MANAGER } from '@nestjs/cache-manager'
import { hash } from 'typeorm/util/StringUtils'
import {
  FilterOperator,
  FilterSuffix,
  paginate,
  PaginateQuery,
} from 'nestjs-paginate'
import { ResponseCategoryDto } from '../dto/response-category.dto'
import { CategoryNotificationGateway } from '../../../websockets/notifications/category-notification.gateway'
import {
  Notification,
  NotificationType,
} from '../../../websockets/notifications/models/notification.model'

@Injectable()
export class CategoryService {
  private logger = new Logger('CategoryService')

  constructor(
    private readonly categoryMapper: CategoryMapper,
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private readonly notificationGateway: CategoryNotificationGateway,
  ) {}

  async findAll(query: PaginateQuery) {
    this.logger.log('Searching all categories')
    const cache: ResponseCategoryDto[] = await this.cacheManager.get(
      `all_categories_page_${hash(JSON.stringify(query))}`,
    )
    if (cache) {
      this.logger.log('Cache hit')
      return cache
    }
    const page = await paginate(query, this.categoryRepository, {
      sortableColumns: ['name'],
      defaultSortBy: [['name', 'ASC']],
      searchableColumns: ['name'],
      filterableColumns: {
        name: [FilterOperator.EQ, FilterSuffix.NOT],
        isActive: [FilterOperator.EQ, FilterSuffix.NOT],
      },
    })
    await this.cacheManager.set(
      `all_categories_page_${hash(JSON.stringify(query))}`,
      page,
      60,
    )
    return page
  }

  async findOne(id: string) {
    this.logger.log(`Find one categoria by id:${id}`)
    const cache: ResponseCategoryDto = await this.cacheManager.get(
      `category-${id}`,
    )
    if (cache) {
      this.logger.log('Cache hit')
      return cache
    }
    const category = await this.categoryRepository.findOneBy({ id })
    if (!category) {
      throw new NotFoundException(`Category with id ${id} not found`)
    }
    await this.cacheManager.set(`category-${id}`, category, 60)
    return category
  }

  async create(createCategoryDto: CreateCategoryDto) {
    this.logger.log('Creating a new category')
    const category = this.categoryMapper.toEntity(createCategoryDto)
    const categoryCreated = await this.categoryExists(category.name)
    const dto = this.categoryMapper.toDto(categoryCreated)
    await this.invalidateCacheKey('all_categories')
    await this.sendNotification(NotificationType.CREATE, dto)
    return dto
  }

  async update(id: string, updateCategoryDto: UpdateCategoryDto) {
    this.logger.log(`Updating category with id:${id}`)
    const categoryToUpdate = await this.findOne(id)
    if (updateCategoryDto.name) {
      const category = await this.categoryRepository
        .createQueryBuilder('category')
        .where('LOWER(name) = LOWER(:name)', { name: updateCategoryDto.name })
        .getOne()
      if (category && category.id !== categoryToUpdate.id) {
        throw new BadRequestException(
          `Category ${updateCategoryDto.name} already exists`,
        )
      }
      const saved = await this.categoryRepository.save({
        ...categoryToUpdate,
        ...updateCategoryDto,
      })
      const dto = this.categoryMapper.toDto(saved)
      await this.invalidateCacheKey(`category_${id}`)
      await this.invalidateCacheKey('all_categories')
      await this.sendNotification(NotificationType.UPDATE, dto)
      return dto
    }
  }

  async remove(id: string) {
    const category = await this.categoryExists(id)
    if (!category) {
      throw new NotFoundException(`Category #${id} not found`)
    } else {
      await this.invalidateCacheKey(`category_${id}`)
      await this.invalidateCacheKey('all_categories')
      await this.sendNotification(NotificationType.DELETE, category)
      return await this.categoryRepository.remove(category)
    }
  }

  async removeSoft(id: string): Promise<Category> {
    const category = await this.categoryRepository.findOneBy({ id })
    if (!category) {
      throw new NotFoundException(`Category #${id} not found`)
    } else {
      await this.invalidateCacheKey(`category_${id}`)
      await this.invalidateCacheKey('all_categories')
      await this.sendNotification(NotificationType.DELETE, category)
      return await this.categoryRepository.save({
        ...category,
        isActive: false,
      })
    }
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

  async categoryExists(name: string): Promise<Category> {
    const cache: Category = await this.cacheManager.get(`category_name_${name}`)
    if (cache) {
      this.logger.log('Cache hit')
      return cache
    }
    const category = await this.categoryRepository
      .createQueryBuilder('category')
      .where('LOWER(name) = LOWER(:name)', { name })
      .getOne()
    if (!category) {
      const newCategory = new Category()
      newCategory.name = name
      newCategory.isActive = true
      return await this.categoryRepository.save(newCategory)
    } else if (category) {
      if (category.isActive === true) {
        throw new BadRequestException(`Category ${name} already exists`)
      } else if (category.isActive === false) {
        category.isActive = true
        await this.cacheManager.set(`category_name_${name}`, category, 60)
        return await this.categoryRepository.save(category)
      }
    }
  }

  async invalidateCacheKey(keyPattern: string): Promise<void> {
    const cacheKeys = await this.cacheManager.store.keys()
    const keysToDelete = cacheKeys.filter((key) => key.startsWith(keyPattern))
    const promises = keysToDelete.map((key) => this.cacheManager.del(key))
    await Promise.all(promises)
  }

  async sendNotification(type: NotificationType, data: ResponseCategoryDto) {
    const notification = new Notification<ResponseCategoryDto>(
      'category',
      type,
      data,
      new Date(),
    )
    this.notificationGateway.sendMessage(notification)
  }
}
