import { Module } from '@nestjs/common'
import { SuppliersNotificationGateway } from './suppliers-notification.gateway'

@Module({
  providers: [SuppliersNotificationGateway],
  exports: [SuppliersNotificationGateway],
})
export class NotificationsModule {}
