import { Module } from '@nestjs/common'
import { EmployeesService } from './services/employees.service'
import { EmployeesController } from './controller/employees.controller'
import { EmployeesMapper } from './mapper/employees.mapper'
import { NotificationsModule } from '../../websockets/notifications/notifications.module'
import { CacheModule } from '@nestjs/cache-manager'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Employee } from './entities/employee.entity'

@Module({
  controllers: [EmployeesController],
  providers: [EmployeesService, EmployeesMapper],
  imports: [
    NotificationsModule,
    CacheModule.register(),
    TypeOrmModule.forFeature([Employee]),
  ],
})
export class EmployeesModule {}
