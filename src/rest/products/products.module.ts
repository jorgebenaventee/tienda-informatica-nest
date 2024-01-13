import { Module } from '@nestjs/common'
import { ProductsService } from './services/products.service'
import { ProductsController } from './controller/products.controller'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Category } from '../category/entities/category.entity'
import { Product } from './entities/product.entity'
import { ProductMapper } from './mapper/product-mapper'
import { StorageModule } from '../storage/storage.module'
import { CacheModule } from '@nestjs/cache-manager'

@Module({
  controllers: [ProductsController],
  providers: [ProductsService, ProductMapper],
  imports: [
    TypeOrmModule.forFeature([Product]),
    TypeOrmModule.forFeature([Category]),
    StorageModule,
    CacheModule.register(),
  ],
})
export class ProductsModule {}
