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

describe('ProductsService', () => {
  let service: ProductsService
  let productsRepository: Repository<Product>
  let categoryRepository: Repository<Category>
  let mapper: ProductMapper
  let storageService: StorageService
  let cacheManager: Cache

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
        { provide: StorageService, useValue: storageServiceMock },
        { provide: CACHE_MANAGER, useValue: cacheManagerMock },
      ],
    }).compile()

    service = module.get<ProductsService>(ProductsService)
    productsRepository = module.get<Repository<Product>>(
      getRepositoryToken(Product),
    )
    categoryRepository = module.get<Repository<Category>>(
      getRepositoryToken(Category),
    )
    mapper = module.get<ProductMapper>(ProductMapper)
    storageService = module.get<StorageService>(StorageService)
    cacheManager = module.get<Cache>(CACHE_MANAGER)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })
  describe('findAll', () => {
    it('should return an array of products', async () => {
      const paginateOptions = {
        page: 1,
        limit: 3,
        path: 'http://localhost:3000/api/funkos',
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
            'http://localhost:3000/api/funkos?page=1&limit=3&sortBy=id:ASC',
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
      const product = new Product()
      const productResponseDto = new ResponseProductDto()

      jest.spyOn(service, 'checkCategory').mockResolvedValue(category)
      jest.spyOn(mapper, 'toEntity').mockReturnValue(product)
      jest.spyOn(productsRepository, 'save').mockResolvedValue(product)
      jest.spyOn(mapper, 'toDto').mockReturnValue(productResponseDto)
      jest.spyOn(cacheManagerMock.store, 'keys').mockResolvedValue([])

      expect(await service.create(createProductDto)).toEqual(productResponseDto)
    })
  })
  describe('update', () => {
    it('should update a product', async () => {
      const updateProductDto = new UpdateProductDto()
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
      jest.spyOn(service, 'checkCategory').mockResolvedValue(category)
      jest.spyOn(productsRepository, 'save').mockResolvedValue(product)
      jest.spyOn(mapper, 'toDto').mockReturnValue(productResponseDto)
      jest.spyOn(cacheManagerMock.store, 'keys').mockResolvedValue([])

      expect(await service.update('uuid', updateProductDto)).toEqual(
        productResponseDto,
      )
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
      const mockFunko = new Product()
      const mockResponseFunkoDto = new ResponseProductDto()
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

      jest.spyOn(productsRepository, 'findOneBy').mockResolvedValue(mockFunko)

      jest.spyOn(storageService, 'removeFile').mockImplementation()

      jest.spyOn(productsRepository, 'save').mockResolvedValue(mockFunko)

      jest.spyOn(mapper, 'toDto').mockReturnValue(mockResponseFunkoDto)
      jest.spyOn(cacheManager.store, 'keys').mockResolvedValue([])

      jest.spyOn(cacheManager, 'set').mockResolvedValue()

      expect(await service.updateImage('uuid', mockFile)).toEqual(
        mockResponseFunkoDto,
      )
    })
  })
  describe('checkCategory', () => {
    it('should return a category', async () => {
      const category = new Category()
      const mockQuery = {
        where: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(category),
      }
      jest
        .spyOn(categoryRepository, 'createQueryBuilder')
        .mockReturnValue(mockQuery as any)
      expect(await service.checkCategory('PC')).toEqual(category)
    })
    it('should throw a NotFoundException', async () => {
      const mockQuery = {
        where: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(undefined),
      }
      jest
        .spyOn(categoryRepository, 'createQueryBuilder')
        .mockReturnValue(mockQuery as any)
      await expect(service.checkCategory('PC')).rejects.toThrow(
        NotFoundException,
      )
    })
  })
})