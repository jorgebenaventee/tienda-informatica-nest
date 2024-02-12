import { Test, TestingModule } from '@nestjs/testing'
import { ProductsService } from './products.service'
import { Repository } from 'typeorm'
import { Product } from '../entities/product.entity'
import { Category } from '../../category/entities/category.entity'
import { ProductMapper } from '../mapper/product-mapper'
import { getRepositoryToken } from '@nestjs/typeorm'
import { ResponseProductDto } from '../dto/response-product.dto'
import { NotFoundException } from '@nestjs/common'
import { CreateProductDto } from '../dto/create-product.dto'
import { UpdateProductDto } from '../dto/update-product.dto'
import { StorageService } from '../../storage/services/storage.service'
import { Paginated } from 'nestjs-paginate'
import { hash } from 'typeorm/util/StringUtils'
import { Cache } from 'cache-manager'
import { CACHE_MANAGER } from '@nestjs/cache-manager'
import { Supplier } from '../../suppliers/entities/supplier.entity'
import { CategoryService } from '../../category/services/category.service'
import { SuppliersService } from '../../suppliers/services/suppliers.service'

import { Notification } from '../../../websockets/notifications/models/notification.model'
import { NotificationGateway } from '../../../websockets/notifications/notifications.gateway'

describe('ProductsService', () => {
  let service: ProductsService
  let productsRepository: Repository<Product>
  let categoryService: CategoryService
  let suppliersService: SuppliersService
  let mapper: ProductMapper
  let storageService: StorageService
  let cacheManager: Cache
  let notificationGateway: NotificationGateway

  const mapperMock = {
    toDto: jest.fn(),
    toEntity: jest.fn(),
  }

  const cacheManagerMock = {
    get: jest.fn(() => Promise.resolve()),
    set: jest.fn(() => Promise.resolve()),
    store: {
      keys: jest.fn(),
    },
  }

  const notificationGatewayMock = {
    sendMessage: jest.fn(),
  }

  const categoryServiceMock = {
    checkCategory: jest.fn(),
  }

  const suppliersServiceMock = {
    checkSupplier: jest.fn(),
  }

  const storageServiceMock = {
    removeFile: jest.fn(),
    getFileNameWithouUrl: jest.fn(),
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        { provide: getRepositoryToken(Product), useClass: Repository },
        { provide: getRepositoryToken(Category), useClass: Repository },
        { provide: ProductMapper, useValue: mapperMock },
        { provide: CategoryService, useValue: categoryServiceMock },
        { provide: SuppliersService, useValue: suppliersServiceMock },
        { provide: StorageService, useValue: storageServiceMock },
        { provide: CACHE_MANAGER, useValue: cacheManagerMock },
        {
          provide: NotificationGateway,
          useValue: notificationGatewayMock,
        },
      ],
    }).compile()

    service = module.get<ProductsService>(ProductsService)
    productsRepository = module.get<Repository<Product>>(
      getRepositoryToken(Product),
    )
    categoryService = module.get<CategoryService>(CategoryService)
    suppliersService = module.get<SuppliersService>(SuppliersService)
    mapper = module.get<ProductMapper>(ProductMapper)
    storageService = module.get<StorageService>(StorageService)
    cacheManager = module.get<Cache>(CACHE_MANAGER)
    notificationGateway = module.get<NotificationGateway>(NotificationGateway)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })
  describe('findAll', () => {
    it('should return an array of products', async () => {
      const paginateOptions = {
        page: 1,
        limit: 3,
        path: 'http://localhost:3000/api/products',
      }
      const page: any = {
        data: [],
        meta: {
          itemsPerPage: 3,
          totalItems: 19,
          totalPages: 7,
          currentPage: 1,
        },
        links: {
          current:
            'http://localhost:3000/api/products?page=1&limit=3&sortBy=id:ASC',
        },
      } as Paginated<ResponseProductDto>
      jest.spyOn(cacheManager, 'get').mockResolvedValue(page)
      const result: any = await service.findAll(paginateOptions)

      expect(cacheManager.get).toHaveBeenCalledWith(
        `all_products_page_${hash(JSON.stringify(paginateOptions))}`,
      )
      expect(result).toEqual(page)
    })
  })
  describe('findOne', () => {
    it('should return a product', async () => {
      const productResponseDto = new ResponseProductDto()
      jest.spyOn(cacheManager, 'get').mockResolvedValue(Promise.resolve(null))
      const mockQuery = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(productResponseDto),
      }

      jest.spyOn(cacheManagerMock.store, 'keys').mockResolvedValue([])
      jest
        .spyOn(productsRepository, 'createQueryBuilder')
        .mockReturnValue(mockQuery as any)

      jest.spyOn(mapper, 'toDto').mockReturnValue(productResponseDto)
      jest.spyOn(cacheManager, 'set').mockResolvedValue()
      expect(await service.findOne('uuid')).toEqual(productResponseDto)
    })
    it('should throw a NotFoundException', async () => {
      const mockQuery = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(null),
      }
      jest
        .spyOn(productsRepository, 'createQueryBuilder')
        .mockReturnValue(mockQuery as any)
      await expect(service.findOne('uuid')).rejects.toThrow(NotFoundException)
    })
  })
  describe('create', () => {
    it('should create a product', async () => {
      const createProductDto = new CreateProductDto()
      const category = new Category()
      const supplier = new Supplier()
      const product = new Product()
      const productResponseDto = new ResponseProductDto()
      let notification: Notification<ResponseProductDto>

      jest
        .spyOn(notificationGatewayMock, 'sendMessage')
        .mockResolvedValue(notification)
      jest.spyOn(categoryService, 'checkCategory').mockResolvedValue(category)
      jest.spyOn(suppliersService, 'checkSupplier').mockResolvedValue(supplier)
      jest.spyOn(mapper, 'toEntity').mockReturnValue(product)
      jest.spyOn(productsRepository, 'save').mockResolvedValue(product)
      jest.spyOn(mapper, 'toDto').mockReturnValue(productResponseDto)
      jest.spyOn(cacheManagerMock.store, 'keys').mockResolvedValue([])
      jest.spyOn(notificationGateway, 'sendMessage').mockImplementation()

      expect(await service.create(createProductDto)).toEqual(productResponseDto)
      expect(notificationGateway.sendMessage).toHaveBeenCalled()
    })
    it('should throw a BadRequestException because of empty name', async () => {
      const createProductDto = new CreateProductDto()
      createProductDto.name = ''
      await expect(service.create(createProductDto)).rejects.toThrow()
    })
    it('should throw a BadRequestException because of empty weight', async () => {
      const createProductDto = new CreateProductDto()
      createProductDto.weight = null
      await expect(service.create(createProductDto)).rejects.toThrow()
    })
    it('should throw a BadRequestException because of empty price', async () => {
      const createProductDto = new CreateProductDto()
      createProductDto.price = null
      await expect(service.create(createProductDto)).rejects.toThrow()
    })
    it('should throw a BadRequestException because of empty stock', async () => {
      const createProductDto = new CreateProductDto()
      createProductDto.stock = null
      await expect(service.create(createProductDto)).rejects.toThrow()
    })
    it('should throw a BadRequestException because of empty description', async () => {
      const createProductDto = new CreateProductDto()
      createProductDto.description = ''
      await expect(service.create(createProductDto)).rejects.toThrow()
    })
  })
  describe('update', () => {
    it('should update a product', async () => {
      const updateProductDto = new UpdateProductDto()
      updateProductDto.name = 'name'
      updateProductDto.category = 'category'
      updateProductDto.supplier = 'supplier'
      const product = new Product()
      const category = new Category()
      const productResponseDto = new ResponseProductDto()
      const mockQuery = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(product),
      }
      jest
        .spyOn(productsRepository, 'createQueryBuilder')
        .mockReturnValue(mockQuery as any)
      jest.spyOn(categoryService, 'checkCategory').mockResolvedValue(category)
      jest.spyOn(productsRepository, 'save').mockResolvedValue(product)
      jest.spyOn(mapper, 'toDto').mockReturnValue(productResponseDto)
      jest.spyOn(cacheManagerMock.store, 'keys').mockResolvedValue([])

      expect(await service.update('uuid', updateProductDto)).toEqual(
        productResponseDto,
      )
    })
    it('should throw a BadRequestException because of empty name', async () => {
      const updateProductDto = new UpdateProductDto()
      updateProductDto.name = ''
      await expect(service.update('uuid', updateProductDto)).rejects.toThrow()
    })
    it('should throw a BadRequestException because of empty weight', async () => {
      const updateProductDto = new UpdateProductDto()
      updateProductDto.weight = null
      await expect(service.update('uuid', updateProductDto)).rejects.toThrow()
    })
    it('should throw a BadRequestException because of empty price', async () => {
      const updateProductDto = new UpdateProductDto()
      updateProductDto.price = null
      await expect(service.update('uuid', updateProductDto)).rejects.toThrow()
    })
    it('should throw a BadRequestException because of empty stock', async () => {
      const updateProductDto = new UpdateProductDto()
      updateProductDto.stock = null
      await expect(service.update('uuid', updateProductDto)).rejects.toThrow()
    })
    it('should throw a BadRequestException because of empty description', async () => {
      const updateProductDto = new UpdateProductDto()
      updateProductDto.description = ''
      await expect(service.update('uuid', updateProductDto)).rejects.toThrow()
    })
  })
  describe('remove', () => {
    it('should remove a product', async () => {
      const product = new Product()
      const dto = new ResponseProductDto()
      const mockQuery = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(product),
      }
      jest
        .spyOn(productsRepository, 'createQueryBuilder')
        .mockReturnValue(mockQuery as any)
      jest.spyOn(productsRepository, 'remove').mockResolvedValue(product)
      jest.spyOn(mapper, 'toDto').mockReturnValue(dto)
      jest.spyOn(cacheManagerMock.store, 'keys').mockResolvedValue([])

      expect(await service.remove('uuid')).toEqual(dto)
    })
    it('should throw a NotFoundException', async () => {
      const mockQuery = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(null),
      }
      jest
        .spyOn(productsRepository, 'createQueryBuilder')
        .mockReturnValue(mockQuery as any)
      await expect(service.findOne('uuid')).rejects.toThrow(NotFoundException)
    })
  })
  describe('removeSoft', () => {
    it('should set isDeleted to true', async () => {
      const product = new Product()
      const productResponseDto = new ResponseProductDto()
      const mockQuery = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(product),
      }
      jest
        .spyOn(productsRepository, 'createQueryBuilder')
        .mockReturnValue(mockQuery as any)
      jest.spyOn(productsRepository, 'save').mockResolvedValue(product)
      jest.spyOn(mapper, 'toDto').mockReturnValue(productResponseDto)
      jest.spyOn(cacheManagerMock.store, 'keys').mockResolvedValue([])

      expect(await service.removeSoft('uuid')).toEqual(productResponseDto)
    })
    it('should throw a NotFoundException', async () => {
      const mockQuery = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(undefined),
      }
      jest
        .spyOn(productsRepository, 'createQueryBuilder')
        .mockReturnValue(mockQuery as any)
      await expect(service.removeSoft('uuid')).rejects.toThrow(
        NotFoundException,
      )
    })
  })
  describe('updateImage', () => {
    it('should update a product image', async () => {
      const mockProduct = new Product()
      const mockResponseProductDto = new ResponseProductDto()
      const mockFile: Express.Multer.File = {
        fieldname: 'image',
        originalname: 'image',
        encoding: '7bit',
        mimetype: 'image/jpeg',
        destination: 'destination',
        filename: 'filename',
        path: 'path',
        size: 1,
        stream: null,
        buffer: null,
      }

      jest.spyOn(productsRepository, 'findOneBy').mockResolvedValue(mockProduct)

      jest.spyOn(storageService, 'removeFile').mockImplementation()

      jest.spyOn(productsRepository, 'save').mockResolvedValue(mockProduct)

      jest.spyOn(mapper, 'toDto').mockReturnValue(mockResponseProductDto)
      jest.spyOn(cacheManager.store, 'keys').mockResolvedValue([])

      jest.spyOn(cacheManager, 'set').mockResolvedValue()

      expect(await service.updateImage('uuid', mockFile)).toEqual(
        mockResponseProductDto,
      )
    })
  })
})
