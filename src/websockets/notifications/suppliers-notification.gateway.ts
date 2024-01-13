import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets'
import { Server, Socket } from 'socket.io'
import { Logger } from '@nestjs/common'
import { ResponseSupplierDto } from '../../rest/suppliers/dto/response-supplier.dto'
import { Notification, NotificationType } from './models/notification.model'

const ENDPOINT: string = 'ws/api/suppliers'

@WebSocketGateway({ namespace: ENDPOINT })
export class SuppliersNotificationGateway {
  @WebSocketServer()
  server: Server

  private logger: Logger = new Logger('SuppliersNotificationGateway')

  sendMessage(notification: Notification<ResponseSupplierDto>) {
    this.server.emit(notification.type, notification)
  }

  private hadleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`)
    this.server.emit(
      'connection',
      new Notification('Producto', NotificationType.CREATE, null, new Date()),
    )
  }

  private handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`)
  }
}
