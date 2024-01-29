import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common'
import { Order, OrderDocument } from '../schemas/order.schema'
import { Repository } from 'typeorm'
import { PaginateModel } from 'mongoose'
import { InjectModel } from '@nestjs/mongoose'
import { InjectRepository } from '@nestjs/typeorm'
import { OrdersMapper } from '../mapper/orders-mapper'
import { CreateOrderDto } from '../dto/create-order.dto'
import { UpdateOrderDto } from '../dto/update-order.dto'
import { Product } from '../../products/entities/product.entity'

export const PedidosOrderByValues: string[] = ['_id', 'userId']
export const PedidosOrderValues: string[] = ['asc', 'desc']

/**
 * Servicio encargado de gestionar las operaciones relacionadas con los pedidos.
 */
@Injectable()
export class OrdersService {
  private logger = new Logger(OrdersService.name)

  /**
   * Constructor de la clase OrdersService.
   *
   * @param orderRepository - Repositorio de la entidad Order.
   * @param productRepository - Repositorio de la entidad Product.
   * @param ordersMapper - Instancia del servicio OrdersMapper.
   */
  constructor(
    @InjectModel(Order.name)
    private orderRepository: PaginateModel<OrderDocument>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    private readonly ordersMapper: OrdersMapper,
  ) {}

  /**
   * Busca y devuelve todos los pedidos paginados según los parámetros proporcionados.
   *
   * @param page - Número de página.
   * @param limit - Límite de resultados por página.
   * @param orderBy - Campo por el cual se ordenarán los resultados.
   * @param order - Dirección de ordenamiento (ascendente o descendente).
   * @return Promise con los resultados paginados de los pedidos.
   */
  async findAll(page: number, limit: number, orderBy: string, order: string) {
    this.logger.log(
      `Searching all orders by this params: ${JSON.stringify({
        page,
        limit,
        orderBy,
        order,
      })}`,
    )
    const options = {
      page,
      limit,
      sort: {
        [orderBy]: order,
      },
    }

    return await this.orderRepository.paginate({}, options)
  }

  /**
   * Busca y devuelve un pedido según su ID.
   *
   * @param id - ID del pedido a buscar.
   * @return Promise con el pedido encontrado.
   * @throws NotFoundException si el pedido no se encuentra.
   */
  async findOne(id: string) {
    this.logger.log(`Searching order with id: ${id}`)
    const orderToFind = await this.orderRepository.findById(id).exec()
    if (!orderToFind) {
      throw new NotFoundException(`Order with id: ${id} not found`)
    }
    return orderToFind
  }

  /**
   * Busca y devuelve los pedidos asociados a un usuario según su ID.
   *
   * @param userId - ID del usuario cuyos pedidos se buscan.
   * @return Promise con los pedidos asociados al usuario.
   */
  async findByUserId(userId: number) {
    this.logger.log(`Searching order with userId: ${userId}`)
    return await this.orderRepository.find({ userId }).exec()
  }

  /**
   * Crea un nuevo pedido a partir de los datos proporcionados en el DTO.
   *
   * @param createOrderDto - Datos para la creación del pedido.
   * @return Promise con el nuevo pedido creado.
   * @throws BadRequestException si hay problemas con los datos proporcionados.
   */
  async create(createOrderDto: CreateOrderDto): Promise<Order> {
    this.logger.log(`Creating order ${JSON.stringify(createOrderDto)}`)
    console.log(`Saving order: ${createOrderDto}`)

    const orderEntity = this.ordersMapper.toEntity(createOrderDto)

    await this.checkOrder(orderEntity)

    const orderToSave = await this.reserveOrderStock(orderEntity)

    orderToSave.createdAt = new Date()
    orderToSave.updatedAt = new Date()

    return await this.orderRepository.create(orderToSave)
  }

  /**
   * Actualiza un pedido existente según su ID y los datos proporcionados en el DTO de actualización.
   *
   * @param id - ID del pedido a actualizar.
   * @param updateOrderDto - Datos para la actualización del pedido.
   * @return Promise con el pedido actualizado.
   * @throws NotFoundException si el pedido no se encuentra.
   * @throws BadRequestException si hay problemas con los datos proporcionados.
   */
  async update(id: string, updateOrderDto: UpdateOrderDto): Promise<Order> {
    this.logger.log(
      `Updating order with id ${id} and ${JSON.stringify(updateOrderDto)}`,
    )
    const orderToUpdate = await this.orderRepository.findById(id).exec()
    if (!orderToUpdate) {
      throw new NotFoundException(`Order with id: ${id} not found`)
    }

    const orderToBeSaved = this.ordersMapper.toEntity(updateOrderDto)

    await this.returnOrderStock(orderToBeSaved)

    await this.checkOrder(orderToBeSaved)
    const orderToSave = await this.reserveOrderStock(orderToBeSaved)

    return await this.orderRepository
      .findByIdAndUpdate(id, orderToSave, { new: true })
      .exec()
  }

  /**
   * Elimina un pedido según su ID.
   *
   * @param id - ID del pedido a eliminar.
   * @throws NotFoundException si el pedido no se encuentra.
   */
  async remove(id: string) {
    this.logger.log(`Deleting order with id ${id}`)

    const order = await this.orderRepository.findById(id).exec()
    if (!order) {
      throw new NotFoundException(`Order with id: ${id} not found`)
    }
    await this.returnOrderStock(order)
    await this.orderRepository.findByIdAndDelete(id).exec()
  }

  /**
   * Verifica la validez de un pedido, realizando diversas validaciones sobre sus líneas de pedido y productos asociados.
   *
   * @param order - Pedido a verificar.
   * @throws BadRequestException si alguna validación falla.
   */
  private async checkOrder(order: Order): Promise<void> {
    this.logger.log(`Cheking order ${JSON.stringify(order)}`)
    if (!order.orderLines || order.orderLines.length === 0) {
      throw new BadRequestException(
        'No order lines have been added to the current order',
      )
    }
    for (const orderLine of order.orderLines) {
      const product = await this.productRepository.findOneBy({
        id: orderLine.productId,
      })
      if (!product) {
        throw new BadRequestException(
          'The productId of the order line is not valid',
        )
      }
      if (product.stock < orderLine.quantity && orderLine.quantity > 0) {
        throw new BadRequestException(
          `Quantity of product ${product.id} is not enough`,
        )
      }
      if (product.price !== orderLine.productPrice) {
        throw new BadRequestException(
          `Product price and order line price are not the same`,
        )
      }
    }
  }

  /**
   * Reserva el stock de los productos asociados a un pedido.
   *
   * @param order - Pedido cuyo stock se va a reservar.
   * @return Promise con el pedido actualizado tras la reserva de stock.
   */
  private async reserveOrderStock(order: Order): Promise<Order> {
    this.logger.log(`Reserving stock of order ${JSON.stringify(order)}`)

    if (!order.orderLines || order.orderLines.length === 0) {
      throw new BadRequestException(`Order lines are empty`)
    }

    for (const orderLine of order.orderLines) {
      const product = await this.productRepository.findOneBy({
        id: orderLine.productId,
      })
      product.stock -= orderLine.quantity
      await this.productRepository.save(product)
      orderLine.total = orderLine.quantity * orderLine.productPrice
    }

    order.total = order.orderLines.reduce(
      (sum, orderLine) => sum + orderLine.quantity * orderLine.productPrice,
      0,
    )
    order.totalItems = order.orderLines.reduce(
      (sum, orderLine) => sum + orderLine.quantity,
      0,
    )

    return order
  }

  /**
   * Devuelve el stock de los productos asociados a un pedido.
   *
   * @param order - Pedido cuyo stock se va a devolver.
   * @return Promise con el pedido actualizado tras la devolución de stock.
   */
  private async returnOrderStock(order: Order): Promise<Order> {
    this.logger.log(`Returning stock of order ${JSON.stringify(order)}`)
    if (order.orderLines) {
      for (const orderLine of order.orderLines) {
        const product = await this.productRepository.findOneBy({
          id: orderLine.productId,
        })
        product.stock += orderLine.quantity
        await this.productRepository.save(product)
      }
    }
    return order
  }
}
