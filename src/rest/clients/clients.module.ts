import { Module } from '@nestjs/common'
import { ClientsService } from './clients.service'
import { ClientsController } from './clients.controller'
import { ClientMapper } from './client-mapper/client-mapper'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Client } from './entities/client.entity'
import { CacheModule } from '@nestjs/cache-manager'
import { NotificationsModule } from '../../websockets/notifications/notifications.module'
import { EmployeesModule } from '../employees/employees.module'
import { Employee } from '../employees/entities/employee.entity'

@Module({
  controllers: [ClientsController],
  imports: [
    TypeOrmModule.forFeature([Client, Employee]),
    CacheModule.register(),
    NotificationsModule,
    EmployeesModule,
  ],
  providers: [ClientsService, ClientMapper],
})
export class ClientsModule {}
