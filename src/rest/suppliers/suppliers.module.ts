import { Module } from '@nestjs/common'
import { SuppliersService } from './services/suppliers.service'
import { SuppliersController } from './controllers/suppliers.controller'
import { SupplierMapper } from './mappers/supplier-mapper'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Supplier } from './entities/supplier.entity'
import { Category } from '../category/entities/category.entity'
import { CacheModule } from '@nestjs/cache-manager'
import { CategoryModule } from '../category/category.module'
import { NotificationsModule } from '../../websockets/notifications/notifications.module'

@Module({
  controllers: [SuppliersController],
  providers: [SuppliersService, SupplierMapper],
  imports: [
    CategoryModule,
    NotificationsModule,
    CacheModule.register(),
    TypeOrmModule.forFeature([Supplier]),
    TypeOrmModule.forFeature([Category]),
  ],
  exports: [SuppliersService],
})
export class SuppliersModule {}
