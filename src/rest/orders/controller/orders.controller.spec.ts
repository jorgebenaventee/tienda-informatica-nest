import { Test, TestingModule } from '@nestjs/testing'
import { OrdersController } from './orders.controller'
import { OrdersService } from '../services/orders.service'
import { CreateOrderDto } from '../dto/create-order.dto'
import { UpdateOrderDto } from '../dto/update-order.dto'

describe('OrdersController', () => {
  let controller: OrdersController
  let service: OrdersService

  beforeEach(async () => {
    const serviceMock = {
      findAll: jest.fn(),
      findOne: jest.fn(),
      findByUserId: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
    }

    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrdersController],
      providers: [{ provide: OrdersService, useValue: serviceMock }],
    }).compile()

    controller = module.get<OrdersController>(OrdersController)
    service = module.get<OrdersService>(OrdersService)
  })

  it('should call findAll with correct parameters', async () => {
    const findAllSpy = jest.spyOn(service, 'findAll')
    await controller.findAll(1, 10, 'userId', 'asc')
    expect(findAllSpy).toHaveBeenCalledWith(1, 10, 'userId', 'asc')
  })

  it('should call findOne with correct parameters', async () => {
    const findOneSpy = jest.spyOn(service, 'findOne')
    await controller.findOne('1')
    expect(findOneSpy).toHaveBeenCalledWith('1')
  })

  it('should call findByUserId with correct parameters', async () => {
    const findByUserIdSpy = jest.spyOn(service, 'findByUserId')
    await controller.findByUserId(1)
    expect(findByUserIdSpy).toHaveBeenCalledWith(1)
  })

  it('should call create with correct parameters', async () => {
    const createSpy = jest.spyOn(service, 'create')
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
    await controller.create(createOrderDto)
    expect(createSpy).toHaveBeenCalledWith(createOrderDto)
  })

  it('should call update with correct parameters', async () => {
    const updateSpy = jest.spyOn(service, 'update')
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
    await controller.update('1', updateOrderDto)
    expect(updateSpy).toHaveBeenCalledWith('1', updateOrderDto)
  })

  it('should call remove with correct parameters', async () => {
    const removeSpy = jest.spyOn(service, 'remove')
    await controller.remove('1')
    expect(removeSpy).toHaveBeenCalledWith('1')
  })
})
