import { Test, TestingModule } from '@nestjs/testing'
import { INestApplication, NotFoundException } from '@nestjs/common'
import { CreateOrderDto } from '../../../src/rest/orders/dto/create-order.dto'
import * as request from 'supertest'
import { Order } from '../../../src/rest/orders/schemas/order.schema'
import { OrdersService } from '../../../src/rest/orders/services/orders.service'
import { OrdersController } from '../../../src/rest/orders/controller/orders.controller'
import { JwtAuthGuard } from '../../../src/rest/auth/jwt-auth/jwt-auth.guard'
import { RolesGuard } from '../../../src/rest/auth/roles/roles.guard'

describe('OrdersController (e2e)', () => {
  let app: INestApplication
  const myEndpoint = '/orders'

  const order: Order = {
    id: '6536518de9b0d305f193b5ef',
    userId: 2,
    client: {
      name: 'name',
      email: 'email',
      phone: 22,
      address: {
        street: 'street',
        number: 22,
        city: 'city',
        province: 'province',
        country: 'country',
        zip: 22,
      },
    },
    orderLines: [
      {
        productId: 'productId',
        quantity: 2,
        productPrice: 2,
        total: 2,
      },
    ],
    totalItems: 2,
    total: 2,
    createdAt: new Date(),
    updatedAt: new Date(),
    isDeleted: false,
  }
  const createOrderDto: CreateOrderDto = {
    userId: 2,
    client: {
      name: 'name',
      email: 'email',
      phone: 22,
      address: {
        street: 'street',
        number: 22,
        city: 'city',
        province: 'province',
        country: 'country',
        zip: 22,
      },
    },
    orderLines: [
      {
        productId: 'productId',
        quantity: 2,
        productPrice: 2,
        total: 2,
      },
    ],
  }

  const mockOrderService = {
    findAll: jest.fn((page, size) => {
      const start = (page - 1) * size
      const end = page * size
      return [order].slice(start, end)
    }),
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  }

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [OrdersController],
      providers: [
        {
          provide: OrdersService,
          useValue: mockOrderService,
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

  describe('GET/orders', () => {
    it('should return a paginated array of orders', async () => {
      const page = 1
      const size = 1
      mockOrderService.findAll.mockReturnValueOnce([order])
      const { body } = await request(app.getHttpServer())
        .get(myEndpoint)
        .query({ page, size })
        .expect(200)
      expect(body).toHaveLength(size)
    })
  })
  describe('GET/orders/:id', () => {
    it('should return a order', async () => {
      mockOrderService.findOne.mockReturnValueOnce(order)
      const { body } = await request(app.getHttpServer())
        .get(`${myEndpoint}/${order.id}`)
        .expect(200)
      expect(body).toMatchObject(createOrderDto)
    })
    it('should return a NotFoundException', async () => {
      mockOrderService.findOne.mockImplementationOnce(() => {
        throw new NotFoundException()
      })
      await request(app.getHttpServer())
        .get(`${myEndpoint}/${order.id}`)
        .expect(404)
    })
  })
  describe('POST/orders', () => {
    it('should create a order', async () => {
      mockOrderService.create.mockReturnValueOnce(order)
      const { body } = await request(app.getHttpServer())
        .post(myEndpoint)
        .send(createOrderDto)
        .expect(201)
      expect(body).toMatchObject(createOrderDto)
    })
  })
  describe('PUT/orders/:id', () => {
    it('should update a order', async () => {
      mockOrderService.update.mockReturnValueOnce(order)
      const { body } = await request(app.getHttpServer())
        .put(`${myEndpoint}/${order.id}`)
        .send(createOrderDto)
        .expect(201)
      expect(body).toMatchObject(createOrderDto)
    })
  })
  describe('DELETE/orders/:id', () => {
    it('should delete a order', async () => {
      mockOrderService.remove.mockReturnValueOnce(order)
      await request(app.getHttpServer())
        .delete(`${myEndpoint}/${order.id}`)
        .expect(204)
    })
  })
})
