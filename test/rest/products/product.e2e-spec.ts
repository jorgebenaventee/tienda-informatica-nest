import { INestApplication, NotFoundException } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import * as request from 'supertest'
import { CacheModule } from '@nestjs/cache-manager'
import { ResponseProductDto } from '../../../src/rest/products/dto/response-product.dto'
import { CreateProductDto } from '../../../src/rest/products/dto/create-product.dto'
import { UpdateProductDto } from '../../../src/rest/products/dto/update-product.dto'
import { ProductsService } from '../../../src/rest/products/services/products.service'
import { ProductsController } from '../../../src/rest/products/controller/products.controller'
import { JwtAuthGuard } from '../../../src/rest/auth/jwt-auth/jwt-auth.guard'
import { RolesGuard } from '../../../src/rest/auth/roles/roles.guard'

describe('ProductController (e2e)', () => {
  let app: INestApplication
  const myEndpoint = '/products'

  const productResponse: ResponseProductDto = {
    id: 'f5b5f2a0-0fda-4f1e-8a5f-0fbd4d9d9c6e',
    name: 'product 1',
    weight: 10,
    price: 10,
    image: 'https://picsum.photos/200/300',
    stock: 10,
    description: 'description 1',
    createdAt: new Date(),
    updatedAt: new Date(),
    isDeleted: false,
    category: 'category 1',
    supplier: 'supplierId',
  }

  const createProductDto: CreateProductDto = {
    name: 'product 1',
    weight: 10,
    price: 10,
    image: 'https://picsum.photos/200/300',
    stock: 10,
    description: 'description 1',
    isDeleted: false,
    category: 'category 1',
    supplier: 'supplierId',
  }

  const updateProductDto: UpdateProductDto = {
    name: 'product 1',
    weight: 10,
    price: 10,
    image: 'https://picsum.photos/200/300',
    stock: 10,
    description: 'description 1',
    isDeleted: false,
  }

  const mockProductService = {
    findAll: jest.fn((page, size) => {
      const start = (page - 1) * size
      const end = page * size
      return [productResponse].slice(start, end)
    }),
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    removeSoft: jest.fn(),
  }
  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [CacheModule.register()],
      controllers: [ProductsController],
      providers: [
        ProductsService,
        {
          provide: ProductsService,
          useValue: mockProductService,
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
  describe('GET/products', () => {
    it('should return a paginated array of products', async () => {
      const page = 1
      const size = 1
      mockProductService.findAll.mockReturnValue([productResponse])
      const { body } = await request(app.getHttpServer())
        .get(myEndpoint)
        .query({ page, size })
        .expect(200)
      expect(body).toHaveLength(size)
      expect(mockProductService.findAll).toHaveBeenCalledTimes(1)
    })
  })
  describe('GET/products/:id', () => {
    it('should return a product', async () => {
      mockProductService.findOne.mockReturnValue(productResponse)
      const { body } = await request(app.getHttpServer())
        .get(`${myEndpoint}/${productResponse.id}`)
        .expect(200)
      body.createdAt = new Date(body.createdAt)
      body.updatedAt = new Date(body.updatedAt)
      expect(body).toEqual(productResponse)
      expect(mockProductService.findOne).toHaveBeenCalledTimes(1)
    })
    it('should return a NotFoundException', async () => {
      mockProductService.findOne.mockRejectedValue(new NotFoundException())
      await request(app.getHttpServer())
        .get(`${myEndpoint}/${productResponse.id}`)
        .expect(404)
    })
  })
  describe('POST/products', () => {
    it('should create a product', async () => {
      mockProductService.create.mockReturnValue(productResponse)
      const { body } = await request(app.getHttpServer())
        .post(myEndpoint)
        .send(createProductDto)
        .expect(201)
      body.createdAt = new Date(body.createdAt)
      body.updatedAt = new Date(body.updatedAt)
      expect(body).toEqual(productResponse)
      expect(mockProductService.create).toHaveBeenCalledTimes(1)
    })
  })
  describe('PUT/products/:id', () => {
    it('should update a product', async () => {
      mockProductService.update.mockReturnValue(productResponse)
      const { body } = await request(app.getHttpServer())
        .put(`${myEndpoint}/${productResponse.id}`)
        .send(updateProductDto)
        .expect(201)
      body.createdAt = new Date(body.createdAt)
      body.updatedAt = new Date(body.updatedAt)
      expect(body).toEqual(productResponse)
      expect(mockProductService.update).toHaveBeenCalledTimes(1)
    })
    it('should return a NotFoundException', async () => {
      mockProductService.update.mockRejectedValue(new NotFoundException())
      await request(app.getHttpServer())
        .put(`${myEndpoint}/${productResponse.id}`)
        .send(updateProductDto)
        .expect(404)
    })
    it('should return a BadRequestException', async () => {
      mockProductService.update.mockRejectedValue(new NotFoundException())
      await request(app.getHttpServer())
        .put(`${myEndpoint}/1`)
        .send({ ...updateProductDto, id: '1' })
        .expect(400)
    })
  })
  describe('DELETE/products/:id', () => {
    it('should return a product with isDeleted true', async () => {
      mockProductService.removeSoft.mockReturnValue(productResponse)
      await request(app.getHttpServer())
        .delete(`${myEndpoint}/${productResponse.id}`)
        .expect(204)
    })
    it('should return a NotFoundException', async () => {
      mockProductService.removeSoft.mockRejectedValue(new NotFoundException())
      await request(app.getHttpServer())
        .delete(`${myEndpoint}/${productResponse.id}`)
        .expect(404)
    })
  })
})
