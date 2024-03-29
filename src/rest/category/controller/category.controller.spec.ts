import { Test, TestingModule } from '@nestjs/testing'
import { CategoryController } from './category.controller'
import { CategoryService } from '../services/category.service'
import { Category } from '../entities/category.entity'
import { NotFoundException } from '@nestjs/common'
import { CacheModule } from '@nestjs/cache-manager'
import { Paginated } from 'nestjs-paginate'

describe('CategoryController', () => {
  let controller: CategoryController
  let service: CategoryService
  const mockCategoryService = {
    findAll: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    changeIsActive: jest.fn(),
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [CacheModule.register()],
      controllers: [CategoryController],
      providers: [{ provide: CategoryService, useValue: mockCategoryService }],
    }).compile()

    controller = module.get<CategoryController>(CategoryController)
    service = module.get<CategoryService>(CategoryService)
  })

  it('should be defined', () => {
    expect(controller).toBeDefined()
  })
  describe('findAll', () => {
    it('should return an array of categories', async () => {
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
      jest.spyOn(service, 'findAll').mockResolvedValue(page)
      const result: any = await controller.findAll(paginateOptions)

      expect(result.meta.totalPages).toEqual(4)
      expect(service.findAll).toHaveBeenCalled()
    })
  })
  describe('findOne', () => {
    it('should return a category', async () => {
      const id = 'uuid'
      const result: Category = new Category()
      jest.spyOn(service, 'findOne').mockResolvedValue(result)
      await controller.findOne(id)
      expect(service.findOne).toHaveBeenCalledWith(id)
      expect(result).toBeInstanceOf(Category)
    })
    it('should throw a NotFoundException', async () => {
      const id = 'uuid'
      jest.spyOn(service, 'findOne').mockRejectedValue(new NotFoundException())
      await expect(controller.findOne(id)).rejects.toThrow(NotFoundException)
    })
  })
  describe('create', () => {
    it('should create a category', async () => {
      const result: Category = new Category()
      const category = new Category()
      jest.spyOn(service, 'create').mockResolvedValue(result)
      await controller.create(category)
      expect(service.create).toHaveBeenCalledWith(category)
      expect(result).toBeInstanceOf(Category)
    })
  })
  describe('update', () => {
    it('should update a category', async () => {
      const id = 'uuid'
      const result: Category = new Category()
      const category = new Category()
      jest.spyOn(service, 'update').mockResolvedValue(result)
      await controller.update(id, category)
      expect(service.update).toHaveBeenCalledWith(id, category)
      expect(result).toBeInstanceOf(Category)
    })
  })
  /*  describe('removeSoft', () => {
      it('should change isActive to false', async () => {
        const id = 'uuid'
        const result: Category = new Category()
        jest.spyOn(service, 'removeSoft').mockResolvedValue(result)
        await controller.remove(id)
        expect(service.removeSoft).toHaveBeenCalledWith(id)
        expect(result).toBeInstanceOf(Category)
      })
      it('should throw a NotFoundException', async () => {
        const id = 'uuid'
        jest
          .spyOn(service, 'removeSoft')
          .mockRejectedValue(new NotFoundException())
        await expect(controller.remove(id)).rejects.toThrow(NotFoundException)
      })
    })*/
})
