import { Module } from '@nestjs/common'
import { NotificationGateway } from './notifications.gateway'

@Module({
  providers: [NotificationGateway],
  exports: [NotificationGateway],
})
export class NotificationsModule {}
