import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets'
import { Server, Socket } from 'socket.io'
import { Logger } from '@nestjs/common'
import { Notification, NotificationType } from './models/notification.model'
import { ResponseProductDto } from '../../rest/products/dto/response-product.dto'

const ENDPOINT: string = 'ws/api/products'

@WebSocketGateway({ namespace: ENDPOINT })
export class ProductsNotificationGateway {
  @WebSocketServer()
  server: Server

  private logger: Logger = new Logger('ProductsNotificationGateway')

  sendMessage(notification: Notification<ResponseProductDto>) {
    this.server.emit(notification.type, notification)
  }

  private hadleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`)
    this.server.emit(
      'connection',
      new Notification('Product', NotificationType.CREATE, null, new Date()),
    )
  }

  private handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`)
  }
}
