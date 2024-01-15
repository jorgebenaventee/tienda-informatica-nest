import { Test, TestingModule } from '@nestjs/testing'
import { CategoryService } from './category.service'
import { Repository } from 'typeorm'
import { Category } from '../entities/category.entity'
import { CategoryMapper } from '../mapper/category-mapper'
import { getRepositoryToken } from '@nestjs/typeorm'
import { CreateCategoryDto } from '../dto/create-category.dto'
import { BadRequestException, NotFoundException } from '@nestjs/common'
import { CACHE_MANAGER } from '@nestjs/cache-manager'
import { Paginated } from 'nestjs-paginate'
import { hash } from 'typeorm/util/StringUtils'
import { ResponseCategoryDto } from '../dto/response-category.dto'
import { CategoryNotificationGateway } from '../../../websockets/notifications/category-notification.gateway'
import { Notification } from '../../../websockets/notifications/models/notification.model'

describe('CategoryService', () => {
  let service: CategoryService
  let repository: Repository<Category>
  let mapper: CategoryMapper
  let cache: Cache
  let notificationGateway: CategoryNotificationGateway

  const mapperMock = {
    toEntity: jest.fn(),
    toDto: jest.fn(),
  }

  const cacheMock = {
    get: jest.fn(),
    set: jest.fn(),
    store: { keys: jest.fn() },
  }

  const notificationGatewayMock = {
    sendMessage: jest.fn(),
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CategoryService,
        { provide: CategoryMapper, useValue: mapperMock },
        {
          provide: getRepositoryToken(Category),
          useClass: Repository,
        },
        { provide: CACHE_MANAGER, useValue: cacheMock },
        {
          provide: CategoryNotificationGateway,
          useValue: notificationGatewayMock,
        },
      ],
    }).compile()

    service = module.get<CategoryService>(CategoryService)
    repository = module.get<Repository<Category>>(getRepositoryToken(Category))
    mapper = module.get<CategoryMapper>(CategoryMapper)
    cache = module.get<Cache>(CACHE_MANAGER)
    notificationGateway = module.get<CategoryNotificationGateway>(
      CategoryNotificationGateway,
    )
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  describe('findAll', () => {
    it('should return a page of categories', async () => {
      const paginateOptions = {
        page: 1,
        limit: 10,
        path: 'http://localhost:3000/api/category',
      }

      const page = {
        data: [],
        meta: {
          itemsPerPage: 1,
          totalItems: 4,
          currentPage: 1,
          totalPages: 4,
        },
        links: {
          current:
            'http://localhost:3000/category?page=1&limit=1&sortBy=name:ASC',
        },
      } as Paginated<Category>
      jest.spyOn(cacheMock, 'get').mockResolvedValue(page)
      const result: any = await service.findAll(paginateOptions)

      expect(cacheMock.get).toHaveBeenCalledWith(
        `all_categories_page_${hash(JSON.stringify(paginateOptions))}`,
      )
      expect(result).toEqual(page)
    })
  })
  describe('findOne', () => {
    it('should create a category', async () => {
      const category = new Category()
      jest.spyOn(cacheMock, 'get').mockResolvedValue(Promise.resolve(null))
      jest.spyOn(repository, 'findOneBy').mockResolvedValue(category)
      expect(
        await service.findOne('d69cf3db-b77d-4181-b3cd-5ca8107fb6a7'),
      ).toEqual(category)
    })
    jest.spyOn(cacheMock.store, 'keys').mockResolvedValue([])
    it('should throw a NotFoundException', async () => {
      jest.spyOn(repository, 'findOneBy').mockResolvedValue(undefined)
      await expect(
        service.findOne('d69cf3db-b77d-4181-b3cd-5ca8107fb6a7'),
      ).rejects.toThrow(NotFoundException)
    })
  })
  describe('create', () => {
    it('should return a category', async () => {
      const category = new Category()
      category.name = 'MARVEL'

      const dto = new ResponseCategoryDto()
      let notification: Notification<ResponseCategoryDto>

      const mockQuery = {
        where: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(undefined),
      }
      jest
        .spyOn(notificationGatewayMock, 'sendMessage')
        .mockResolvedValue(notification)
      jest
        .spyOn(repository, 'createQueryBuilder')
        .mockReturnValue(mockQuery as any)
      jest.spyOn(mapper, 'toEntity').mockReturnValue(category)
      jest.spyOn(repository, 'save').mockResolvedValue(category)
      jest.spyOn(mapper, 'toDto').mockReturnValue(dto)
      jest.spyOn(service, 'categoryExists').mockResolvedValue(null)
      jest.spyOn(cacheMock.store, 'keys').mockResolvedValue([])
      jest.spyOn(notificationGateway, 'sendMessage').mockImplementation()

      const result = await service.create(dto)
      expect(result).toEqual(dto)
      expect(notificationGateway.sendMessage).toHaveBeenCalled()
    })
    it('should throw a BadRequestException because of empty  name', async () => {
      const createCategory = new CreateCategoryDto()
      createCategory.name = ''
      await expect(service.create(createCategory)).rejects.toThrow(TypeError)
    })
  })
  describe('update', () => {
    it('should update a category', async () => {
      const category = new Category()
      category.name = 'PC'

      const dto = new ResponseCategoryDto()

      const mockQuery = {
        where: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(category),
      }

      jest
        .spyOn(repository, 'createQueryBuilder')
        .mockReturnValue(mockQuery as any)
      jest.spyOn(repository, 'findOneBy').mockResolvedValue(category)
      jest.spyOn(repository, 'save').mockResolvedValue(category)
      jest.spyOn(mapper, 'toDto').mockReturnValue(dto)
      jest.spyOn(cacheMock.store, 'keys').mockResolvedValue([])

      const result = await service.update(category.id, category)
      expect(dto).toEqual(result)
    })
    it('should throw a BadRequestException because of empty name', async () => {
      const createCategory = new CreateCategoryDto()
      createCategory.name = ''
      await expect(service.create(createCategory)).rejects.toThrow(TypeError)
    })
  })
  describe('remove', () => {
    it('should remove a category', async () => {
      const category = new Category()

      jest.spyOn(service, 'categoryExists').mockResolvedValue(category)
      jest.spyOn(repository, 'remove').mockResolvedValue(category)

      const result = await service.remove('uuid')
      expect(result).toEqual(category)
    })
    it('should throw a NotFoundException', async () => {
      jest.spyOn(service, 'categoryExists').mockReturnValue(null)
      await expect(service.remove('uuid')).rejects.toThrow(NotFoundException)
    })
  })

  describe('changeIsActive', () => {
    it('should change isActive to false', async () => {
      const category = new Category()
      category.name = 'MARVEL'
      category.isActive = true

      const mockQuery = {
        where: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(category),
      }

      jest
        .spyOn(repository, 'createQueryBuilder')
        .mockReturnValue(mockQuery as any)
      jest.spyOn(repository, 'findOneBy').mockResolvedValue(category)
      jest.spyOn(repository, 'save').mockResolvedValue(category)

      const result = await service.removeSoft(
        'd69cf3db-b77d-4181-b3cd-5ca8107fb6a7',
      )
      expect(result).toEqual(category)
    })
    it('should throw a NotFoundException', async () => {
      jest.spyOn(repository, 'findOneBy').mockReturnValue(null)
      await expect(
        service.removeSoft('d69cf3db-b77d-4181-b3cd-5ca8107fb6a7'),
      ).rejects.toThrow(NotFoundException)
    })
  })
  describe('categoryExists', () => {
    it('should create and return a new category if not exists', async () => {
      const newCategory = new Category()
      newCategory.name = 'PC'
      newCategory.isActive = true

      const mockQuery = {
        where: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(undefined),
      }

      jest
        .spyOn(repository, 'createQueryBuilder')
        .mockReturnValue(mockQuery as any)
      jest.spyOn(repository, 'save').mockResolvedValue(newCategory)

      const result = await service.categoryExists('PC')
      expect(result).toEqual(newCategory)
    })

    it('should activate and return an inactive category', async () => {
      const existingCategory = new Category()
      existingCategory.name = 'PC'
      existingCategory.isActive = false

      const mockQuery = {
        where: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(existingCategory),
      }

      jest
        .spyOn(repository, 'createQueryBuilder')
        .mockReturnValue(mockQuery as any)
      jest.spyOn(repository, 'save').mockResolvedValue(existingCategory)

      const result = await service.categoryExists('PC')
      expect(result).toEqual(existingCategory)
      expect(existingCategory.isActive).toBe(true)
    })
    it('should throw BadRequestException if category is already active', async () => {
      const existingCategory = new Category()
      existingCategory.name = 'PC'
      existingCategory.isActive = true

      const mockQuery = {
        where: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(existingCategory),
      }
      jest
        .spyOn(repository, 'createQueryBuilder')
        .mockReturnValue(mockQuery as any)
      jest.spyOn(repository, 'save').mockResolvedValue(existingCategory)
      await expect(service.categoryExists('PC')).rejects.toThrow(
        BadRequestException,
      )
    })
  })
})
