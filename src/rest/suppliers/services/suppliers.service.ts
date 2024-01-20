import { Inject, Injectable, Logger, NotFoundException } from '@nestjs/common'
import { CreateSupplierDto } from '../dto/create-supplier.dto'
import { UpdateSupplierDto } from '../dto/update-supplier.dto'
import { SupplierMapper } from '../mappers/supplier-mapper'
import { Supplier } from '../entities/supplier.entity'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Category } from '../../category/entities/category.entity'
import { Cache } from 'cache-manager'
import { CACHE_MANAGER } from '@nestjs/cache-manager'
import { ResponseSupplierDto } from '../dto/response-supplier.dto'
import {
  Notification,
  NotificationType,
} from '../../../websockets/notifications/models/notification.model'
import {
  FilterOperator,
  FilterSuffix,
  paginate,
  PaginateQuery,
} from 'nestjs-paginate'
import { hash } from 'typeorm/util/StringUtils'
import { CategoryService } from '../../category/services/category.service'
import { NotificationGateway } from '../../../websockets/notifications/notifications.gateway'
/**
 * Service class for managing suppliers.
 * @class
 */
@Injectable()
export class SuppliersService {
  /**
   * Logger instance for logging service operations.
   */
  private logger = new Logger('SuppliersService ')

  /**
   * Constructor for SuppliersService.
   * @constructor
   * @param {SupplierMapper} supplierMapper - Mapper for supplier data.
   * @param {Repository<Supplier>} supplierRepository - Repository for managing supplier entities.
   * @param {Cache} cacheManager - Cache manager for caching supplier data.
   * @param {CategoryService} categoryService - Service for managing categories.
   * @param {NotificationGateway} notificationGateway - Gateway for sending notifications.
   */
  constructor(
    private readonly supplierMapper: SupplierMapper,
    @InjectRepository(Supplier)
    private readonly supplierRepository: Repository<Supplier>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private readonly categoryService: CategoryService,
    private readonly notificationGateway: NotificationGateway,
  ) {}

  /**
   * Fetches all suppliers.
   * @async
   * @param {PaginateQuery} query - Pagination query.
   * @returns {Promise<ResponseSupplierDto[]>} - Promise object represents the list of suppliers.
   */
  async findAll(query: PaginateQuery) {
    this.logger.log('Searching for all suppliers')

    const cache: ResponseSupplierDto[] = await this.cacheManager.get(
      `all_suppliers_page_${hash(JSON.stringify(query))}`,
    )

    if (cache) {
      this.logger.log('Suppliers found in cache')
      return cache
    }

    const suppliers = this.supplierRepository
      .createQueryBuilder('supplier')
      .leftJoinAndSelect('supplier.category', 'category')

    const page = await paginate(query, suppliers, {
      sortableColumns: ['name', 'contact', 'address', 'category'],
      defaultSortBy: [['id', 'ASC']],
      searchableColumns: ['name', 'contact', 'address', 'category'],
      filterableColumns: {
        name: [FilterOperator.CONTAINS, FilterSuffix.NOT, FilterOperator.EQ],
        contact: [FilterOperator.CONTAINS, FilterSuffix.NOT, FilterOperator.EQ],
        address: [FilterOperator.CONTAINS, FilterSuffix.NOT, FilterOperator.EQ],
        category: [
          FilterOperator.CONTAINS,
          FilterSuffix.NOT,
          FilterOperator.EQ,
        ],
      },
    })

    const dto = {
      data: (page.data ?? []).map((supplier) =>
        this.supplierMapper.toDto(supplier),
      ),
      meta: page.meta,
      links: page.links,
    }
    await this.cacheManager.set(
      `all_suppliers_page_${hash(JSON.stringify(query))}`,
      dto,
      60,
    )
    return dto
  }

  /**
   * Fetches a supplier by ID.
   * @async
   * @param {string} id - Supplier ID.
   * @returns {Promise<ResponseSupplierDto>} - Promise object represents the supplier.
   */
  async findOne(id: string) {
    this.logger.log(`Searching for supplier with id: ${id}`)

    const cache: ResponseSupplierDto = await this.cacheManager.get(
      `supplier_${id}`,
    )

    if (cache) {
      this.logger.log('Supplier found in cache')
      return cache
    }

    const supplier = await this.supplierRepository
      .createQueryBuilder('supplier')
      .leftJoinAndSelect('supplier.category', 'category')
      .where('supplier.id = :id', { id })
      .getOne()
    if (!supplier) {
      throw new NotFoundException(`Supplier with id: ${id} not found`)
    } else {
      const dto = this.supplierMapper.toDto(supplier)
      await this.cacheManager.set(`supplier_${id}`, dto, 60)
      return dto
    }
  }

  /**
   * Creates a new supplier.
   * @async
   * @param {CreateSupplierDto} createSupplierDto - Data transfer object for creating a supplier.
   * @returns {Promise<ResponseSupplierDto>} - Promise object represents the created supplier.
   */
  async create(createSupplierDto: CreateSupplierDto) {
    this.logger.log('Creating supplier')
    const category: Category = await this.categoryService.checkCategory(
      createSupplierDto.category,
    )
    const supplier = this.supplierMapper.toEntity(createSupplierDto, category)
    const supplierCreated = await this.supplierRepository.save(supplier)
    const dto = this.supplierMapper.toDto(supplierCreated)
    await this.invalidateCacheKey('all_suppliers_page_')
    await this.sendNotification(NotificationType.CREATE, dto)
    return dto
  }

  /**
   * Updates a supplier by ID.
   * @async
   * @param {string} id - Supplier ID.
   * @param {UpdateSupplierDto} updateSupplierDto - Data transfer object for updating a supplier.
   * @returns {Promise<ResponseSupplierDto>} - Promise object represents the updated supplier.
   */
  async update(id: string, updateSupplierDto: UpdateSupplierDto) {
    this.logger.log(`Updating supplier with id: ${id}`)
    const supplier = await this.supplierRepository
      .createQueryBuilder('supplier')
      .where('supplier.id = :id and supplier.is_deleted = false', { id })
      .getOne()
    if (!supplier) {
      throw new NotFoundException(`Supplier with id: ${id} not found`)
    }
    if (updateSupplierDto.category) {
      const category: Category = await this.categoryService.checkCategory(
        updateSupplierDto.category,
      )
      const supplierUpdated = await this.supplierRepository.save({
        ...supplier,
        ...updateSupplierDto,
        category,
      })
      const dto = this.supplierMapper.toDto(supplierUpdated)
      await this.invalidateCacheKey('all_suppliers_page_')
      await this.invalidateCacheKey(`supplier_${id}`)
      await this.sendNotification(NotificationType.UPDATE, dto)
      return dto
    } else {
      const supplierUpdated = await this.supplierRepository.save({
        ...supplier,
        ...updateSupplierDto,
        category: supplier.category,
      })
      const dto = this.supplierMapper.toDto(supplierUpdated)
      await this.invalidateCacheKey('all_suppliers_page_')
      await this.invalidateCacheKey(`supplier_${id}`)
      await this.sendNotification(NotificationType.UPDATE, dto)
      return dto
    }
  }

  /**
   * Removes a supplier by ID.
   * @async
   * @param {string} id - Supplier ID.
   * @returns {Promise<ResponseSupplierDto>} - Promise object represents the removed supplier.
   */
  async remove(id: string) {
    this.logger.log(`Deleting supplier with id: ${id}`)
    const supplier = await this.supplierRepository
      .createQueryBuilder('supplier')
      .where('supplier.id = :id and supplier.is_deleted = false', { id })
      .getOne()
    if (!supplier) {
      throw new NotFoundException(`Supplier with id: ${id} not found`)
    }
    const supplierDeleted = await this.supplierRepository.save({
      ...supplier,
      isDeleted: true,
    })
    const dto = this.supplierMapper.toDto(supplierDeleted)
    await this.invalidateCacheKey('all_suppliers_page_')
    await this.invalidateCacheKey(`supplier_${id}`)
    await this.sendNotification(NotificationType.DELETE, dto)
    return dto
  }

  /**
   * Checks if a supplier exists by ID.
   * @async
   * @param {string} idSupplier - Supplier ID.
   * @returns {Promise<Supplier>} - Promise object represents the supplier.
   */
  async checkSupplier(idSupplier: string) {
    this.logger.log(`Searching for supplier with name: ${idSupplier}`)
    const supplier = await this.supplierRepository
      .createQueryBuilder('supplier')
      .where('supplier.id = :id and' + ' supplier.is_deleted = :is_deleted', {
        id: idSupplier,
        is_deleted: false,
      })
      .getOne()
    if (!supplier) {
      throw new NotFoundException(`Supplier with id: ${idSupplier} not found`)
    }
    return supplier
  }

  /**
   * Invalidates cache keys by pattern.
   * @async
   * @param {string} keyPattern - Cache key pattern.
   * @returns {Promise<void>} - Promise object represents the operation result.
   */
  async invalidateCacheKey(keyPattern: string): Promise<void> {
    const cacheKeys = await this.cacheManager.store.keys()
    const keysToDelete = cacheKeys.filter((key) => key.startsWith(keyPattern))
    const promises = keysToDelete.map((key) => this.cacheManager.del(key))
    await Promise.all(promises)
  }

  /**
   * Sends a notification.
   * @async
   * @param {NotificationType} type - Notification type.
   * @param {ResponseSupplierDto} data - Notification data.
   * @returns {Promise<void>} - Promise object represents the operation result.
   */
  async sendNotification(type: NotificationType, data: ResponseSupplierDto) {
    const notification = new Notification<ResponseSupplierDto>(
      'supplier',
      type,
      data,
      new Date(),
    )
    this.notificationGateway.sendMessage(notification)
  }
}
