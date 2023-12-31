import { Module } from '@nestjs/common'
import { CategoryModule } from './category/category.module'
import { TypeOrmModule } from '@nestjs/typeorm'
import { ProductMapper } from './products/mapper/product-mapper'
import { CategoryMapper } from './category/mapper/category-mapper'
import { ProductsModule } from './products/products.module'
import { SuppliersModule } from './suppliers/suppliers.module'
import { SupplierMapper } from './suppliers/mappers/supplier-mapper'

@Module({
  imports: [
    ProductsModule,
    CategoryModule,
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'admin',
      password: 'admin1234',
      database: 'clowns',
      synchronize: true,
      autoLoadEntities: true,
      entities: [`${__dirname}/**/*.entity{.ts,.js}`],
    }),
    SuppliersModule,
  ],
  providers: [ProductMapper, CategoryMapper, SupplierMapper],
})
export class AppModule {}
