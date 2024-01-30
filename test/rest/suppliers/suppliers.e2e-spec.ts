import { Test, TestingModule } from '@nestjs/testing'
import { INestApplication, NotFoundException } from '@nestjs/common'
import * as request from 'supertest'
import { ResponseSupplierDto } from '../../../src/rest/suppliers/dto/response-supplier.dto'
import { CreateSupplierDto } from '../../../src/rest/suppliers/dto/create-supplier.dto'
import { UpdateSupplierDto } from '../../../src/rest/suppliers/dto/update-supplier.dto'
import { CacheModule } from '@nestjs/cache-manager'
import { SuppliersController } from '../../../src/rest/suppliers/controllers/suppliers.controller'
import { SuppliersService } from '../../../src/rest/suppliers/services/suppliers.service'
import { JwtAuthGuard } from '../../../src/rest/auth/jwt-auth/jwt-auth.guard'
import { RolesGuard } from '../../../src/rest/auth/roles/roles.guard'

describe('SupplierController (e2e)', () => {
  let app: INestApplication
  const endpoint = '/suppliers'

  const mySupplierResponse: ResponseSupplierDto = {
    id: 'f5b5f2a0-0fda-4f1e-8a5f-0fbd4d9d9c6e',
    name: 'Supplier 1',
    contact: 612345678,
    address: 'Calle 123',
    hired_at: new Date(),
    category: 'PC',
    is_deleted: false,
  }

  const createSupplierDto: CreateSupplierDto = {
    name: 'Supplier 1',
    contact: 612345678,
    address: 'Calle 123',
    hired_at: new Date(),
    category: 'PC',
    is_deleted: false,
  }

  const updateSupplierDto: UpdateSupplierDto = {
    name: 'Supplier 1',
    contact: 612345678,
    address: 'Calle 123',
    hired_at: new Date(),
    category: 'PC',
    is_deleted: false,
  }

  const mockSupplierService = {
    findAll: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  }

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [CacheModule.register()],
      controllers: [SuppliersController],
      providers: [
        SuppliersService,
        {
          provide: SuppliersService,
          useValue: mockSupplierService,
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

  describe('GET /suppliers', () => {
    it('should return a page of suppliers', async () => {
      mockSupplierService.findAll.mockResolvedValue([mySupplierResponse])

      const { body } = await request(app.getHttpServer())
        .get(endpoint)
        .expect(200)

      body[0].hired_at = new Date(body[0].hired_at)

      expect(body).toEqual([mySupplierResponse])
      expect(mockSupplierService.findAll).toHaveBeenCalled()
    })

    it('should return a page of suppliers with query', async () => {
      mockSupplierService.findAll.mockResolvedValue([mySupplierResponse])

      const { body } = await request(app.getHttpServer())
        .get('/suppliers?page=1&limit=10')
        .expect(200)

      body[0].hired_at = new Date(body[0].hired_at)

      expect(body).toEqual([mySupplierResponse])
      expect(mockSupplierService.findAll).toHaveBeenCalled()
    })
  })

  describe('GET /suppliers/:id', () => {
    it('should return a supplier', async () => {
      mockSupplierService.findOne.mockResolvedValue(mySupplierResponse)

      const { body } = await request(app.getHttpServer())
        .get(`${endpoint}/${mySupplierResponse.id}`)
        .expect(200)

      body.hired_at = new Date(body.hired_at)

      expect(body).toEqual(mySupplierResponse)
      expect(mockSupplierService.findOne).toHaveBeenCalled()
    })

    it('should return a supplier with invalid id', async () => {
      mockSupplierService.findOne.mockResolvedValue(mySupplierResponse)

      const { body } = await request(app.getHttpServer())
        .get(`${endpoint}/1`)
        .expect(400)

      expect(body).toEqual({
        statusCode: 400,
        message: 'Validation failed (uuid is expected)',
        error: 'Bad Request',
      })
      expect(mockSupplierService.findOne).toHaveBeenCalled()
    })

    it('should return a supplier with not found id', async () => {
      mockSupplierService.findOne.mockRejectedValue(new NotFoundException())

      await request(app.getHttpServer())
        .get(`${endpoint}/${mySupplierResponse.id}`)
        .expect(404)
    })
  })

  describe('POST /suppliers', () => {
    it('should create a supplier', async () => {
      mockSupplierService.create.mockResolvedValue(mySupplierResponse)

      const { body } = await request(app.getHttpServer())
        .post(endpoint)
        .send(createSupplierDto)
        .expect(201)

      body.hired_at = new Date(body.hired_at)

      expect(body).toEqual(mySupplierResponse)
      expect(mockSupplierService.create).toHaveBeenCalled()
    })
  })

  describe('PUT /suppliers/:id', () => {
    it('should update a supplier', async () => {
      mockSupplierService.update.mockResolvedValue(mySupplierResponse)

      const { body } = await request(app.getHttpServer())
        .put(`${endpoint}/${mySupplierResponse.id}`)
        .send(updateSupplierDto)
        .expect(201)

      body.hired_at = new Date(body.hired_at)

      expect(body).toEqual(mySupplierResponse)
      expect(mockSupplierService.update).toHaveBeenCalled()
    })

    it('should return a 404', async () => {
      mockSupplierService.update.mockRejectedValue(new NotFoundException())

      await request(app.getHttpServer())
        .put(`${endpoint}/${mySupplierResponse.id}`)
        .send(updateSupplierDto)
        .expect(404)
    })
  })

  describe('DELETE /suppliers/:id', () => {
    it('should delete a supplier', async () => {
      mockSupplierService.remove.mockResolvedValue(mySupplierResponse)

      await request(app.getHttpServer())
        .delete(`${endpoint}/${mySupplierResponse.id}`)
        .expect(204)

      expect(mockSupplierService.remove).toHaveBeenCalled()
    })

    it('should return a 404', async () => {
      mockSupplierService.remove.mockRejectedValue(new NotFoundException())

      await request(app.getHttpServer())
        .delete(`${endpoint}/${mySupplierResponse.id}`)
        .expect(404)
    })
  })
})
