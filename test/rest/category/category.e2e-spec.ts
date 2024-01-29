import { CreateCategoryDto } from 'src/rest/category/dto/create-category.dto'
import { UpdateCategoryDto } from 'src/rest/category/dto/update-category.dto'
import { ResponseCategoryDto } from '../../../src/rest/category/dto/response-category.dto'
import { INestApplication, NotFoundException } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import { CacheModule } from '@nestjs/cache-manager'
import { JwtAuthGuard } from 'src/rest/auth/jwt-auth/jwt-auth.guard'
import { RolesGuard } from '../../../src/rest/auth/roles/roles.guard'
import * as request from 'supertest'
import { CategoryController } from '../../../src/rest/category/controller/category.controller'
import { CategoryService } from 'src/rest/category/services/category.service'

describe('categoryController (e2e)', () => {
  let app: INestApplication
  const myEndpoint = '/category'

  const createCategoryDto: CreateCategoryDto = {
    name: 'category 1',
  }

  const updateCategoryDto: UpdateCategoryDto = {
    name: 'Category updated',
  }
  const categoryDto: ResponseCategoryDto = {
    id: '0c80b908-b076-4228-b448-cc28ea211cd4',
    name: 'category 1',
    createdAt: new Date(),
    updatedAt: new Date(),
  }
  const mockCategoryService = {
    findAll: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    removeSoft: jest.fn(),
  }
  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [CacheModule.register()],
      controllers: [CategoryController],
      providers: [
        CategoryService,
        {
          provide: CategoryService,
          useValue: mockCategoryService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: () => true })
      .compile()

    app = moduleFixture.createNestApplication()
    await app.init()
  })
  afterAll(async () => {
    await app.close()
  })

  describe('GET /category', () => {
    it('should return a paginated array of categories', async () => {
      const limit = 10
      const paginatedResult = {
        items: [categoryDto],
        total: 1,
        limit,
      }
      mockCategoryService.findAll.mockResolvedValue(paginatedResult)
      const { body } = await request(app.getHttpServer())
        .get(`${myEndpoint}?limit=${limit}`)
        .expect(200)

      const bodyDate = body.items.map((category) => {
        category.createdAt = new Date(category.createdAt)
        category.updatedAt = new Date(category.updatedAt)
        return category
      })
      expect(bodyDate).toEqual(paginatedResult.items)
      expect(body.total).toEqual(paginatedResult.total)
      expect(body.limit).toEqual(paginatedResult.limit)
      expect(mockCategoryService.findAll).toHaveBeenCalledTimes(1)
    })
  })
  describe('GET /category/:id', () => {
    it('should return a category', async () => {
      mockCategoryService.findOne.mockResolvedValue(categoryDto)
      const { body } = await request(app.getHttpServer())
        .get(`${myEndpoint}/${categoryDto.id}`)
        .expect(200)
      body.createdAt = new Date(body.createdAt)
      body.updatedAt = new Date(body.updatedAt)
      expect(body).toEqual(categoryDto)
      expect(mockCategoryService.findOne).toHaveBeenCalledTimes(1)
    })
    it('should return a NotFoundException', async () => {
      mockCategoryService.findOne.mockRejectedValue(new NotFoundException())
      await request(app.getHttpServer())
        .get(`${myEndpoint}/${categoryDto.id}`)
        .expect(404)
    })
  })
  describe('POST /category', () => {
    it('should create a category', async () => {
      mockCategoryService.create.mockResolvedValue(categoryDto)
      const { body } = await request(app.getHttpServer())
        .post(myEndpoint)
        .send(createCategoryDto)
        .expect(201)
      body.createdAt = new Date(body.createdAt)
      body.updatedAt = new Date(body.updatedAt)
      expect(body).toEqual(categoryDto)
      expect(mockCategoryService.create).toHaveBeenCalledTimes(1)
    })
  })
  describe('PUT /category/:id', () => {
    it('should update a category', async () => {
      mockCategoryService.update.mockResolvedValue(categoryDto)
      const { body } = await request(app.getHttpServer())
        .put(`${myEndpoint}/${categoryDto.id}`)
        .send(updateCategoryDto)
        .expect(200)
      body.createdAt = new Date(body.createdAt)
      body.updatedAt = new Date(body.updatedAt)
      expect(body).toEqual(categoryDto)
      expect(mockCategoryService.update).toHaveBeenCalledTimes(1)
    })
    it('should return a NotFoundException', async () => {
      mockCategoryService.update.mockRejectedValue(new NotFoundException())
      await request(app.getHttpServer())
        .put(`${myEndpoint}/${categoryDto.id}`)
        .send(updateCategoryDto)
        .expect(404)
    })
  })
  describe('DELETE /category/:id', () => {
    it('should delete a category', async () => {
      mockCategoryService.removeSoft.mockResolvedValue(categoryDto)
      await request(app.getHttpServer())
        .delete(`${myEndpoint}/${categoryDto.id}`)
        .expect(204)
    })
    it('should return a NotFoundException', async () => {
      mockCategoryService.removeSoft.mockRejectedValue(new NotFoundException())
      await request(app.getHttpServer())
        .delete(`${myEndpoint}/${categoryDto.id}`)
        .expect(404)
    })
  })
})
