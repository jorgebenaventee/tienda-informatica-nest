import { OrdersMapper } from './orders-mapper'
import { CreateOrderDto } from '../dto/create-order.dto'
import { Order } from '../schemas/order.schema'

describe('OrdersMapper', () => {
  let ordersMapper: OrdersMapper

  beforeEach(() => {
    ordersMapper = new OrdersMapper()
  })

  it('should be defined', () => {
    expect(ordersMapper).toBeDefined()
  })

  describe('toEntity', () => {
    it('should convert a CreateOrderDto to an Order entity', () => {
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

      const order: Order = ordersMapper.toEntity(createOrderDto)
      expect(order).toBeInstanceOf(Order)
    })
  })
})
