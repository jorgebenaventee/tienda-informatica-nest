import { Module } from '@nestjs/common'
import { CategoryModule } from './rest/category/category.module'
import { ProductMapper } from './rest/products/mapper/product-mapper'
import { CategoryMapper } from './rest/category/mapper/category-mapper'
import { ProductsModule } from './rest/products/products.module'
import { SuppliersModule } from './rest/suppliers/suppliers.module'
import { SupplierMapper } from './rest/suppliers/mappers/supplier-mapper'
import { StorageModule } from './rest/storage/storage.module'
import { ConfigModule } from '@nestjs/config'
import { DatabaseModule } from './config/database/database.module'

@Module({
  imports: [
    ProductsModule,
    StorageModule,
    CategoryModule,
    ConfigModule.forRoot(),
    DatabaseModule,
    SuppliersModule,
  ],
  providers: [ProductMapper, CategoryMapper, SupplierMapper],
})
export class AppModule {}
