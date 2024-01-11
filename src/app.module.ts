import { Module } from '@nestjs/common'
import { CategoryModule } from './category/category.module'
import { TypeOrmModule } from '@nestjs/typeorm'
import { ProductMapper } from './products/mapper/product-mapper'
import { CategoryMapper } from './category/mapper/category-mapper'
import { ProductsModule } from './products/products.module'
import { SuppliersModule } from './suppliers/suppliers.module'
import { SupplierMapper } from './suppliers/mappers/supplier-mapper'
import { StorageModule } from './rest/storage/storage.module'
import { ConfigModule } from '@nestjs/config'

@Module({
  imports: [
    ProductsModule,
    StorageModule,
    CategoryModule,
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: parseInt(process.env.POSTGRES_PORT) || 5432,
      username: process.env.DATABASE_USER,
      password: process.env.DATABASE_PASSWORD,
      database: process.env.POSTGRES_DATABASE,
      synchronize: process.env.NODE_ENV === 'dev',
      autoLoadEntities: true,
      entities: [`${__dirname}/**/*.entity{.ts,.js}`],
    }),
    SuppliersModule,
  ],
  providers: [ProductMapper, CategoryMapper, SupplierMapper],
})
export class AppModule {}
