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
 * Clase de servicio para gestionar Suppliers.
 * @class SuppliersService
 */
@Injectable()
export class SuppliersService {
  /**
   * Instancia de Logger para registrar las operaciones del servicio.
   */
  private logger = new Logger('SuppliersService ')

  /**
   * Constructor para SuppliersService.
   * @constructor
   * @param {SupplierMapper} supplierMapper - Mapper para los datos del Supplier.
   * @param {Repository<Supplier>} supplierRepository - Repositorio para gestionar las entidades del Supplier.
   * @param {Cache} cacheManager - Gestor de caché para almacenar en caché los datos del Supplier.
   * @param {CategoryService} categoryService - Servicio para gestionar las categorías.
   * @param {NotificationGateway} notificationGateway - Gateway para enviar notificaciones.
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
   * Obtiene todos los Suppliers.
   * @async
   * @param {PaginateQuery} query - Consulta de paginación.
   * @returns {Promise<ResponseSupplierDto[]>} - Lista de Suppliers.
   */
  async findAll(query: PaginateQuery) {
    this.logger.log('Searching for all suppliers')
    this.logger.log(JSON.stringify(query))

    if (!query.filter) {
      query.filter = { is_deleted: 'false' }
    } else if (query.filter.is_deleted === undefined) {
      query.filter.is_deleted = 'false'
    }

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
      sortableColumns: ['name', 'contact', 'address', 'is_deleted', 'category'],
      defaultSortBy: [['id', 'ASC']],
      searchableColumns: [
        'name',
        'contact',
        'address',
        'is_deleted',
        'category',
      ],
      filterableColumns: {
        name: [FilterOperator.CONTAINS, FilterSuffix.NOT, FilterOperator.EQ],
        contact: [FilterOperator.CONTAINS, FilterSuffix.NOT, FilterOperator.EQ],
        address: [FilterOperator.CONTAINS, FilterSuffix.NOT, FilterOperator.EQ],
        is_deleted: [FilterOperator.EQ],
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
   * Obtiene un Supplier por ID.
   * @async
   * @param {string} id - ID del Supplier.
   * @returns {Promise<ResponseSupplierDto>} - Supplier.
   */
  async findOne(id: string): Promise<ResponseSupplierDto> {
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
   * Crea un nuevo Supplier.
   * @async
   * @param {CreateSupplierDto} createSupplierDto - Objeto de transferencia de datos para crear un Supplier.
   * @returns {Promise<ResponseSupplierDto>} - Supplier creado.
   */
  async create(
    createSupplierDto: CreateSupplierDto,
  ): Promise<ResponseSupplierDto> {
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
   * Actualiza un Supplier por ID.
   * @async
   * @param {string} id - ID del Supplier.
   * @param {UpdateSupplierDto} updateSupplierDto - Objeto de transferencia de datos para actualizar un Supplier.
   * @returns {Promise<ResponseSupplierDto>} - Supplier actualizado.
   */
  async update(
    id: string,
    updateSupplierDto: UpdateSupplierDto,
  ): Promise<ResponseSupplierDto> {
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
   * Elimina un Supplier por ID.
   * @async
   * @param {string} id - ID del Supplier.
   * @returns {Promise<ResponseSupplierDto>} - Supplier eliminado.
   */
  async remove(id: string): Promise<ResponseSupplierDto> {
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
      is_deleted: true,
    })
    const dto = this.supplierMapper.toDto(supplierDeleted)
    await this.invalidateCacheKey('all_suppliers_page_')
    await this.invalidateCacheKey(`supplier_${id}`)
    await this.sendNotification(NotificationType.DELETE, dto)
    return dto
  }

  /**
   * Comprueba si existe un Supplier por ID.
   * @async
   * @param {string} idSupplier - ID del Supplier.
   * @returns {Promise<Supplier>} - Supplier.
   */
  async checkSupplier(idSupplier: string): Promise<Supplier> {
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
   * Invalida las claves de caché por patrón.
   * @async
   * @param {string} keyPattern - Patrón de clave de caché.
   * @returns {Promise<void>} - Supplier resultado de la operación.
   */
  async invalidateCacheKey(keyPattern: string): Promise<void> {
    const cacheKeys = await this.cacheManager.store.keys()
    const keysToDelete = cacheKeys.filter((key) => key.startsWith(keyPattern))
    const promises = keysToDelete.map((key) => this.cacheManager.del(key))
    await Promise.all(promises)
  }

  /**
   * Envía una notificación.
   * @async
   * @param {NotificationType} type - Tipo de notificación.
   * @param {ResponseSupplierDto} data - Datos de la notificación.
   * @returns {Promise<void>} - Supplier resultado de la operación.
   */
  async sendNotification(
    type: NotificationType,
    data: ResponseSupplierDto,
  ): Promise<void> {
    const notification = new Notification<ResponseSupplierDto>(
      'supplier',
      type,
      data,
      new Date(),
    )
    this.notificationGateway.sendMessage(notification)
  }
}
