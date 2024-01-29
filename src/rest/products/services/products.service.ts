import { BadRequestException, Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { CreateProductDto } from '../dto/create-product.dto';
import { UpdateProductDto } from '../dto/update-product.dto';
import { ProductMapper } from '../mapper/product-mapper';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from '../entities/product.entity';
import { Repository } from 'typeorm';
import { Category } from '../../category/entities/category.entity';
import { StorageService } from '../../storage/services/storage.service';
import { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { FilterOperator, FilterSuffix, paginate, PaginateQuery } from 'nestjs-paginate';
import { hash } from 'typeorm/util/StringUtils';
import { ResponseProductDto } from '../dto/response-product.dto';
import { SuppliersService } from '../../suppliers/services/suppliers.service';
import { CategoryService } from '../../category/services/category.service';
import { Notification, NotificationType } from '../../../websockets/notifications/models/notification.model';
import { NotificationGateway } from '../../../websockets/notifications/notifications.gateway';

/**
 * Servicio que gestiona las operaciones relacionadas con los productos.
 */
@Injectable()
export class ProductsService {
  private logger = new Logger('ProductsService ')

  /**
   * Constructor del servicio de productos.
   *
   * @param storageService - Servicio de almacenamiento de archivos.
   * @param productMapper - Mapeador de productos.
   * @param productRepository - Repositorio de productos proporcionado por TypeORM.
   * @param categoryService - Servicio de categorías.
   * @param cacheManager - Gestor de caché.
   * @param supplierService - Servicio de proveedores.
   * @param notificationGateway - Puerta de enlace para enviar notificaciones a través de WebSockets.
   */
  constructor(
    private readonly storageService: StorageService,
    private readonly productMapper: ProductMapper,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    private readonly categoryService: CategoryService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private readonly supplierService: SuppliersService,
    private readonly notificationGateway: NotificationGateway,
  ) {}

  /**
   * Busca y devuelve una página paginada de productos.
   *
   * @param query - Objeto que contiene los parámetros de paginación y filtrado.
   * @return Una Promise que resuelve a la página paginada de productos.
   */
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
      .leftJoinAndSelect('product.supplier', 'supplier')

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

  /**
   * Busca y devuelve un producto por su identificador único.
   *
   * @param id - Identificador único del producto a buscar.
   * @return Una Promise que resuelve al DTO del producto encontrado.
   * @throws NotFoundException si el producto no se encuentra.
   */
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
      .leftJoinAndSelect('product.supplier', 'supplier')
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

  /**
   * Crea un nuevo producto a partir de los datos proporcionados.
   *
   * @param createProductDto - Datos para la creación del producto.
   * @return Una Promise que resuelve al DTO del producto creado.
   */
  async create(createProductDto: CreateProductDto) {
    this.logger.log('Product created')
    const category: Category = await this.categoryService.checkCategory(
      createProductDto.category,
    )
    const supplier = await this.supplierService.checkSupplier(
      createProductDto.supplier,
    )
    const product = this.productMapper.toEntity(
      createProductDto,
      category,
      supplier,
    )
    const productCreated = await this.productRepository.save(product)
    const dto = this.productMapper.toDto(productCreated)
    await this.invalidateCacheKey('all_products_page_')
    await this.sendNotification(NotificationType.CREATE, dto)
    return dto
  }

  /**
   * Actualiza un producto existente según el identificador único.
   *
   * @param id - Identificador único del producto a actualizar.
   * @param updateProductDto - Datos para la actualización del producto.
   * @return Una Promise que resuelve al DTO del producto actualizado.
   * @throws NotFoundException si el producto o la categoría no se encuentran.
   */
  async update(id: string, updateProductDto: UpdateProductDto) {
    this.logger.log(`Updating product with id: ${id}`)
    const category: Category = await this.categoryService.checkCategory(
      updateProductDto.category,
    )
    const supplier = await this.supplierService.checkSupplier(
      updateProductDto.supplier,
    )
    const product = await this.productRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.category', 'category')
      .leftJoinAndSelect('product.supplier', 'supplier')
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
      supplier,
    })
    const dto = this.productMapper.toDto(productUpdated)
    await this.invalidateCacheKey('all_products_page_')
    await this.invalidateCacheKey(`product_${id}`)
    await this.sendNotification(NotificationType.UPDATE, dto)
    return dto
  }

  /**
   * Elimina un producto según el identificador único.
   *
   * @param id - Identificador único del producto a eliminar.
   * @return Una Promise que resuelve al DTO del producto eliminado.
   * @throws NotFoundException si el producto no se encuentra.
   */
  async remove(id: string) {
    this.logger.log(`Removing product with id: ${id}`)
    const products = await this.productRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.category', 'category')
      .leftJoinAndSelect('product.supplier', 'supplier')
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
    await this.sendNotification(NotificationType.DELETE, dto)
    return dto
  }

  /**
   * Realiza una eliminación suave de un producto según el identificador único.
   *
   * @param id - Identificador único del producto a eliminar suavemente.
   * @return Una Promise que resuelve al DTO del producto eliminado suavemente.
   * @throws NotFoundException si el producto no se encuentra.
   */
  async removeSoft(id: string) {
    this.logger.log(`Removing soft product with id: ${id}`)
    const products = await this.productRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.category', 'category')
      .leftJoinAndSelect('product.supplier', 'supplier')
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
    await this.sendNotification(NotificationType.DELETE, dto)
    return dto
  }

  /**
   * Actualiza la imagen de un producto según el identificador único y el archivo proporcionado.
   *
   * @param id - Identificador único del producto a actualizar.
   * @param file - Archivo de imagen a asociar al producto.
   * @return Una Promise que resuelve al DTO del producto con la imagen actualizada.
   * @throws NotFoundException si el producto no se encuentra.
   * @throws BadRequestException si no se proporciona un archivo.
   */
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
    await this.sendNotification(NotificationType.UPDATE, dto)
    return dto
  }

  /**
   * Invalida las claves de caché que coinciden con el patrón dado.
   *
   * @param keyPattern - Patrón de clave de caché a invalidar.
   * @return Una Promise que se resuelve cuando la invalidación de la caché está completa.
   */
  async invalidateCacheKey(keyPattern: string): Promise<void> {
    const cacheKeys = await this.cacheManager.store.keys()
    const keysToDelete = cacheKeys.filter((key) => key.startsWith(keyPattern))
    const promises = keysToDelete.map((key) => this.cacheManager.del(key))
    await Promise.all(promises)
  }

  /**
   * Envía una notificación a través de WebSockets con información sobre la operación realizada.
   *
   * @param type - Tipo de notificación (CREATE, UPDATE, DELETE).
   * @param data - Datos de la notificación relacionados con el producto.
   */
  async sendNotification(type: NotificationType, data: ResponseProductDto) {
    const notification = new Notification<ResponseProductDto>(
      'products',
      type,
      data,
      new Date(),
    )
    this.notificationGateway.sendMessage(notification)
  }
}
