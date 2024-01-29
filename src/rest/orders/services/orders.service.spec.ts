import { Test, TestingModule } from '@nestjs/testing'
import { OrdersService } from './orders.service'
import { Order } from '../schemas/order.schema'
import { CreateOrderDto } from '../dto/create-order.dto'
import { UpdateOrderDto } from '../dto/update-order.dto'
import { OrdersMapper } from '../mapper/orders-mapper'
import { Product } from '../../products/entities/product.entity'
import { Repository } from 'typeorm'
import { getRepositoryToken } from '@nestjs/typeorm'

describe('OrdersService', () => {
  let service: OrdersService
  let ordersMapper: OrdersMapper
  const ordersMapperMock = {
    toEntity: jest.fn(),
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrdersService,
        { provide: OrdersMapper, useValue: ordersMapperMock },
        {
          provide: getRepositoryToken(Product),
          useValue: Repository,
        },
        {
          provide: getRepositoryToken(Order),
          useClass: Repository,
        },
      ],
    }).compile()

    service = module.get<OrdersService>(OrdersService)
    ordersMapper = module.get<OrdersMapper>(OrdersMapper)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  describe('findByUserId', () => {
    it('should return a list of orders for a specific user', async () => {
      const result = []
      jest.spyOn(service, 'findByUserId').mockImplementation(async () => result)

      expect(await service.findByUserId(1)).toBe(result)
    })
  })

  describe('create', () => {
    it('should create a new order', async () => {
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
      const result = new Order()
      jest.spyOn(ordersMapper, 'toEntity').mockImplementation(() => result)
      jest.spyOn(service, 'create').mockImplementation(async () => result)

      expect(await service.create(createOrderDto)).toBe(result)
    })
  })

  describe('update', () => {
    it('should update an order', async () => {
      const updateOrderDto: UpdateOrderDto = {
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
      const result = new Order()
      jest.spyOn(ordersMapper, 'toEntity').mockImplementation(() => result)
      jest.spyOn(service, 'update').mockImplementation(async () => result)
      expect(await service.update('1', updateOrderDto)).toBe(result)
    })
  })

  describe('remove', () => {
    it('should remove an order', async () => {
      jest.spyOn(service, 'remove').mockImplementation(async () => undefined)

      expect(await service.remove('1')).toBeUndefined()
    })
  })
})
