import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets'
import { Server, Socket } from 'socket.io'
import { Logger } from '@nestjs/common'
import { Notification, NotificationType } from './models/notification.model'
import { ResponseCategoryDto } from '../../rest/category/dto/response-category.dto'

const ENDPOINT: string = 'ws/api/categories'

@WebSocketGateway({ namespace: ENDPOINT })
export class CategoryNotificationGateway {
  @WebSocketServer()
  server: Server

  private logger: Logger = new Logger('CategoryNotificationGateway')

  sendMessage(notification: Notification<ResponseCategoryDto>) {
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
