import { Test, TestingModule } from '@nestjs/testing'
import { SuppliersService } from './suppliers.service'
import { Supplier } from '../entities/supplier.entity'
import { Repository } from 'typeorm'
import { Category } from '../../category/entities/category.entity'
import { SupplierMapper } from '../mappers/supplier-mapper'
import { getRepositoryToken } from '@nestjs/typeorm'
import { ResponseSupplierDto } from '../dto/response-supplier.dto'
import { NotFoundException } from '@nestjs/common'
import { CreateSupplierDto } from '../dto/create-supplier.dto'
import { UpdateSupplierDto } from '../dto/update-supplier.dto'
import { CategoryService } from '../../category/services/category.service'
import { Cache } from 'cache-manager'
import { CACHE_MANAGER } from '@nestjs/cache-manager'
import { Notification } from '../../../websockets/notifications/models/notification.model'
import { Paginated } from 'nestjs-paginate'
import { NotificationGateway } from '../../../websockets/notifications/notifications.gateway'

describe('SuppliersService', () => {
  let service: SuppliersService
  let suppliersRepository: Repository<Supplier>
  let categoryService: CategoryService
  let mapper: SupplierMapper
  let cacheManager: Cache
  let notificationGateway: NotificationGateway

  const categoryServiceMock = {
    checkCategory: jest.fn(),
  }

  const mapperMock = {
    toDto: jest.fn(),
    toEntity: jest.fn(),
  }

  const notificationGatewayMock = {
    sendMessage: jest.fn(),
  }

  const cacheManagerMock = {
    get: jest.fn(() => Promise.resolve()),
    set: jest.fn(() => Promise.resolve()),
    store: {
      keys: jest.fn(),
    },
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SuppliersService,
        { provide: CategoryService, useValue: categoryServiceMock },
        { provide: getRepositoryToken(Supplier), useClass: Repository },
        { provide: getRepositoryToken(Category), useClass: Repository },
        { provide: SupplierMapper, useValue: mapperMock },
        { provide: CACHE_MANAGER, useValue: cacheManagerMock },
        {
          provide: NotificationGateway,
          useValue: notificationGatewayMock,
        },
      ],
    }).compile()

    service = module.get<SuppliersService>(SuppliersService)
    categoryService = module.get<CategoryService>(CategoryService)
    suppliersRepository = module.get<Repository<Supplier>>(
      getRepositoryToken(Supplier),
    )
    mapper = module.get<SupplierMapper>(SupplierMapper)
    cacheManager = module.get<Cache>(CACHE_MANAGER)
    notificationGateway = module.get<NotificationGateway>(NotificationGateway)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  describe('findAll', () => {
    it('should return a page of suppliers', async () => {
      const paginateOptions = {
        page: 1,
        limit: 10,
        path: 'suppliers',
      }

      jest.spyOn(cacheManager, 'get').mockResolvedValue(Promise.resolve(null))
      jest.spyOn(cacheManager, 'set').mockResolvedValue()

      const mockQueryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        addOrderBy: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([]),
        andWhere: jest.fn().mockReturnThis(),
      }

      jest
        .spyOn(suppliersRepository, 'createQueryBuilder')
        .mockReturnValue(mockQueryBuilder as any)
      jest.spyOn(mapper, 'toDto').mockReturnValue(new ResponseSupplierDto())

      const result: any = await service.findAll(paginateOptions)
      expect(result.meta.itemsPerPage).toEqual(paginateOptions.limit)
      expect(result.meta.currentPage).toEqual(paginateOptions.page)
      expect(result.links.current).toEqual(
        `${paginateOptions.path}?page=${paginateOptions.page}&limit=${paginateOptions.limit}&sortBy=id:ASC&filter.is_deleted=false`,
      )
      expect(cacheManager.get).toHaveBeenCalled()
      expect(cacheManager.set).toHaveBeenCalled()
    })
    it('should return a page of suppliers from cache', async () => {
      const paginateOptions = {
        page: 1,
        limit: 10,
        path: 'suppliers',
      }

      const testSuppliers = {
        data: [],
        meta: {
          itemsPerPage: 10,
          totalItems: 1,
          totalPages: 1,
          currentPage: 1,
        },
        links: {
          current:
            'http://localhost:3000/suppliers?page=1&limit=10&sort=name:ASC',
        },
      } as Paginated<ResponseSupplierDto>

      jest
        .spyOn(cacheManager.store, 'keys')
        .mockResolvedValue(['suppliers:1:10:ASC'])

      jest.spyOn(cacheManager, 'get').mockResolvedValue(testSuppliers)

      const result: any = await service.findAll(paginateOptions)

      expect(result.meta.itemsPerPage).toEqual(paginateOptions.limit)
      expect(result.meta.currentPage).toEqual(paginateOptions.page)
      expect(result.links.current).toEqual(
        `http://localhost:3000/suppliers?page=${paginateOptions.page}&limit=${paginateOptions.limit}&sort=name:ASC`,
      )
      expect(cacheManager.get).toHaveBeenCalled()
    })
  })

  describe('findOne', () => {
    it('should return a supplier', async () => {
      jest.spyOn(cacheManager, 'get').mockResolvedValue(Promise.resolve(null))
      const supplierResponseDto: ResponseSupplierDto = {
        id: '3c34de0e-ffb9-4f26-9264-b1673ad35b03',
        name: 'supplier',
        contact: 1,
        address: 'address',
        hired_at: new Date(),
        category: 'category',
        is_deleted: false,
      }
      const mockQuery = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(supplierResponseDto),
      }
      jest
        .spyOn(suppliersRepository, 'createQueryBuilder')
        .mockReturnValue(mockQuery as any)

      jest.spyOn(mapper, 'toDto').mockReturnValue(supplierResponseDto)

      const result = await service.findOne(
        '3c34de0e-ffb9-4f26-9264-b1673ad35b03',
      )
      expect(result).toEqual(supplierResponseDto)
    })
    it('should throw a NotFoundException', async () => {
      jest.spyOn(cacheManager, 'get').mockResolvedValue(Promise.resolve(null))
      const mockQuery = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(undefined),
      }
      jest
        .spyOn(suppliersRepository, 'createQueryBuilder')
        .mockReturnValue(mockQuery as any)
      const result = service.findOne('3c34de0e-ffb9-4f26-9264-b1673ad35b03')
      await expect(result).rejects.toThrow(NotFoundException)
    })
    it('should return a supplier from cache', async () => {
      const supplierResponseDto: ResponseSupplierDto = {
        id: '3c34de0e-ffb9-4f26-9264-b1673ad35b03',
        name: 'supplier',
        contact: 1,
        address: 'address',
        hired_at: new Date(),
        category: 'category',
        is_deleted: false,
      }
      jest
        .spyOn(cacheManager.store, 'keys')
        .mockResolvedValue(['supplier_3c34de0e-ffb9-4f26-9264-b1673ad35b03'])
      jest
        .spyOn(cacheManager, 'get')
        .mockResolvedValue(supplierResponseDto as any)
      const result = await service.findOne(
        '3c34de0e-ffb9-4f26-9264-b1673ad35b03',
      )
      expect(result).toEqual(supplierResponseDto)
    })
  })

  describe('create', () => {
    it('should create a supplier', async () => {
      const createSupplierDto: CreateSupplierDto = {
        name: 'supplier',
        contact: 1,
        address: 'address',
        hired_at: new Date(),
        category: 'category',
        is_deleted: false,
      }
      const mockCategory = new Category()
      const mockSupplier = new Supplier()
      const supplierReponseDto = new ResponseSupplierDto()
      let notification: Notification<ResponseSupplierDto>

      jest
        .spyOn(notificationGatewayMock, 'sendMessage')
        .mockResolvedValue(notification)
      jest
        .spyOn(categoryService, 'checkCategory')
        .mockResolvedValue(mockCategory)
      jest.spyOn(mapper, 'toEntity').mockReturnValue(mockSupplier)
      jest.spyOn(suppliersRepository, 'save').mockResolvedValue(mockSupplier)
      jest.spyOn(cacheManager.store, 'keys').mockResolvedValue([])
      jest.spyOn(mapper, 'toDto').mockReturnValue(supplierReponseDto)
      jest.spyOn(notificationGateway, 'sendMessage').mockImplementation()

      const result = await service.create(createSupplierDto)
      expect(result).toEqual(supplierReponseDto)
      expect(notificationGateway.sendMessage).toHaveBeenCalled()
    })
    it('should throw a BadRequest name emtpy', async () => {
      const createSupplierDto: CreateSupplierDto = {
        name: '',
        contact: 1,
        address: 'address',
        hired_at: new Date(),
        category: 'category',
        is_deleted: false,
      }
      const result = service.create(createSupplierDto)
      await expect(result).rejects.toThrow(TypeError)
    })
    it('should throw a BadRequest contact emtpy', async () => {
      const createSupplierDto: CreateSupplierDto = {
        name: 'supplier',
        contact: undefined,
        address: 'address',
        hired_at: new Date(),
        category: 'category',
        is_deleted: false,
      }
      const result = service.create(createSupplierDto)
      await expect(result).rejects.toThrow(TypeError)
    })
    it('should throw a BadRequest address emtpy', async () => {
      const createSupplierDto: CreateSupplierDto = {
        name: 'supplier',
        contact: 1,
        address: '',
        hired_at: new Date(),
        category: 'category',
        is_deleted: false,
      }
      const result = service.create(createSupplierDto)
      await expect(result).rejects.toThrow(TypeError)
    })
    it('should throw a BadRequest hired_at emtpy', async () => {
      const createSupplierDto: CreateSupplierDto = {
        name: 'supplier',
        contact: 1,
        address: 'address',
        hired_at: undefined,
        category: 'category',
        is_deleted: false,
      }
      const result = service.create(createSupplierDto)
      await expect(result).rejects.toThrow(TypeError)
    })
    it('should throw a BadRequest category emtpy', async () => {
      const createSupplierDto: CreateSupplierDto = {
        name: 'supplier',
        contact: 1,
        address: 'address',
        hired_at: new Date(),
        category: '',
        is_deleted: false,
      }
      const result = service.create(createSupplierDto)
      await expect(result).rejects.toThrow(TypeError)
    })
    it('should throw a BadRequest is_deleted emtpy', async () => {
      const createSupplierDto: CreateSupplierDto = {
        name: 'supplier',
        contact: 1,
        address: 'address',
        hired_at: new Date(),
        category: 'category',
        is_deleted: undefined,
      }
      const result = service.create(createSupplierDto)
      await expect(result).rejects.toThrow(TypeError)
    })
  })

  describe('update', () => {
    it('should update a supplier', async () => {
      const updateSupplierDto: UpdateSupplierDto = {
        name: 'supplier',
      }
      const supplier = new Supplier()
      const category = new Category()
      const supplierResponseDto = new ResponseSupplierDto()
      const mockQuery = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(supplier),
      }
      jest
        .spyOn(suppliersRepository, 'createQueryBuilder')
        .mockReturnValue(mockQuery as any)
      jest.spyOn(categoryService, 'checkCategory').mockResolvedValue(category)
      jest.spyOn(suppliersRepository, 'save').mockResolvedValue(supplier)
      jest.spyOn(mapper, 'toDto').mockReturnValue(supplierResponseDto)

      const result = await service.update(
        '3c34de0e-ffb9-4f26-9264-b1673ad35b03',
        updateSupplierDto,
      )
      expect(result).toEqual(supplierResponseDto)
    })
    it('should throw a NotFoundException', async () => {
      const updateSupplierDto: UpdateSupplierDto = {
        name: 'supplier',
        contact: 1,
        address: 'address',
        hired_at: new Date(),
        category: 'category',
        is_deleted: false,
      }
      const mockQuery = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(undefined),
      }
      jest
        .spyOn(suppliersRepository, 'createQueryBuilder')
        .mockReturnValue(mockQuery as any)
      const result = service.update(
        '3c34de0e-ffb9-4f26-9264-b1673ad35b03',
        updateSupplierDto,
      )
      await expect(result).rejects.toThrow(NotFoundException)
    })
    it('should throw a BadRequest name emtpy', async () => {
      const updateSupplierDto: UpdateSupplierDto = {
        name: '',
      }
      const result = service.update(
        '3c34de0e-ffb9-4f26-9264-b1673ad35b03',
        updateSupplierDto,
      )
      await expect(result).rejects.toThrow(TypeError)
    })
    it('should throw a BadRequest contact emtpy', async () => {
      const updateSupplierDto: UpdateSupplierDto = {
        contact: undefined,
      }
      const result = service.update(
        '3c34de0e-ffb9-4f26-9264-b1673ad35b03',
        updateSupplierDto,
      )
      await expect(result).rejects.toThrow(TypeError)
    })
    it('should throw a BadRequest address emtpy', async () => {
      const updateSupplierDto: UpdateSupplierDto = {
        address: '',
      }
      const result = service.update(
        '3c34de0e-ffb9-4f26-9264-b1673ad35b03',
        updateSupplierDto,
      )
      await expect(result).rejects.toThrow(TypeError)
    })
    it('should throw a BadRequest hired_at emtpy', async () => {
      const updateSupplierDto: UpdateSupplierDto = {
        hired_at: undefined,
      }
      const result = service.update(
        '3c34de0e-ffb9-4f26-9264-b1673ad35b03',
        updateSupplierDto,
      )
      await expect(result).rejects.toThrow(TypeError)
    })
  })

  describe('remove', () => {
    it('should remove a supplier', async () => {
      const supplier = new Supplier()
      const supplierResponseDto = new ResponseSupplierDto()
      const mockQuery = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(supplier),
      }
      jest
        .spyOn(suppliersRepository, 'createQueryBuilder')
        .mockReturnValue(mockQuery as any)
      jest.spyOn(suppliersRepository, 'save').mockResolvedValue(supplier)
      jest.spyOn(mapper, 'toDto').mockReturnValue(supplierResponseDto)
    })
    it('should throw a NotFoundException', async () => {
      const mockQuery = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(undefined),
      }
      jest
        .spyOn(suppliersRepository, 'createQueryBuilder')
        .mockReturnValue(mockQuery as any)
      await expect(
        service.remove('3c34de0e-ffb9-4f26-9264-b1673ad35b03'),
      ).rejects.toThrow(NotFoundException)
    })
  })
})
