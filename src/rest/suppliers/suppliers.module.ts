import { Module } from '@nestjs/common'
import { SuppliersService } from './services/suppliers.service'
import { SuppliersController } from './controllers/suppliers.controller'
import { SupplierMapper } from './mappers/supplier-mapper'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Supplier } from './entities/supplier.entity'
import { Category } from '../category/entities/category.entity'

@Module({
  controllers: [SuppliersController],
  providers: [SuppliersService, SupplierMapper],
  imports: [
    TypeOrmModule.forFeature([Supplier]),
    TypeOrmModule.forFeature([Category]),
  ],
})
export class SuppliersModule {}
