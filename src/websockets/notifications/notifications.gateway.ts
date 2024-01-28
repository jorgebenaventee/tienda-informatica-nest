import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets'
import { Server, Socket } from 'socket.io'
import { Logger } from '@nestjs/common'
import { Notification, NotificationType } from './models/notification.model'
import { ResponseCategoryDto } from '../../rest/category/dto/response-category.dto'
import { ResponseProductDto } from '../../rest/products/dto/response-product.dto'
import { ResponseSupplierDto } from '../../rest/suppliers/dto/response-supplier.dto'
import { ResponseEmployeeDto } from '../../rest/employees/dto/response-employee.dto'

const ENDPOINT: string = 'ws/api/websockets'

@WebSocketGateway({ namespace: ENDPOINT })
export class NotificationGateway {
  @WebSocketServer()
  server: Server

  private logger: Logger = new Logger('NotificationGateway')

  sendMessage(
    notification: Notification<
      | ResponseCategoryDto
      | ResponseProductDto
      | ResponseSupplierDto
      | ResponseEmployeeDto
    >,
  ) {
    this.server.emit(notification.type, notification)
  }

  private hadleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`)
    this.server.emit(
      'connection',
      new Notification('Product', NotificationType.CREATE, null, new Date()),
      new Notification('Category', NotificationType.CREATE, null, new Date()),
      new Notification('Supplier', NotificationType.CREATE, null, new Date()),
    )
  }

  private handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`)
  }
}
