import { Module } from '@nestjs/common'
import { ProductsService } from './services/products.service'
import { ProductsController } from './controller/products.controller'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Category } from '../category/entities/category.entity'
import { Product } from './entities/product.entity'
import { ProductMapper } from './mapper/product-mapper'
import { Supplier } from '../suppliers/entities/supplier.entity'

@Module({
  controllers: [ProductsController],
  providers: [ProductsService, ProductMapper],
  imports: [
    TypeOrmModule.forFeature([Product]),
    TypeOrmModule.forFeature([Category]),
    TypeOrmModule.forFeature([Supplier]),
  ],
})
export class ProductsModule {}
