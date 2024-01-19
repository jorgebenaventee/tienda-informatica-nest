import { Injectable } from '@nestjs/common'
import { plainToClass } from 'class-transformer'
import { CreateOrderDto } from '../dto/create-order.dto'
import { Order } from '../schemas/order.schema'

/**
 * Servicio encargado de mapear entre objetos DTO y entidades de órdenes.
 */
@Injectable()
export class OrdersMapper {
  /**
   * Convierte un objeto de tipo CreateOrderDto a una entidad Order.
   *
   * @param createOrderDto - Datos para la creación de la orden.
   * @return Una instancia de la entidad Order creada a partir de los datos proporcionados.
   */
  toEntity(createOrderDto: CreateOrderDto): Order {
    return plainToClass(Order, createOrderDto)
  }
}
