import { Module } from '@nestjs/common'
import { CategoryModule } from './rest/category/category.module'
import { ProductsModule } from './rest/products/products.module'
import { SuppliersModule } from './rest/suppliers/suppliers.module'
import { StorageModule } from './rest/storage/storage.module'
import { ConfigModule } from '@nestjs/config'
import { DatabaseModule } from './config/database/database.module'
import { NotificationsModule } from './websockets/notifications/notifications.module'
import { OrdersModule } from './rest/orders/orders.module'
import { CacheModule } from '@nestjs/cache-manager'
import { ClientsModule } from './rest/clients/clients.module'
import { EmployeesModule } from './rest/employees/employees.module'
import { AuthModule } from './rest/auth/auth.module'

@Module({
  imports: [
    ConfigModule.forRoot(),
    DatabaseModule,
    CacheModule.register(),
    ProductsModule,
    SuppliersModule,
    CategoryModule,
    StorageModule,
    NotificationsModule,
    OrdersModule,
    ClientsModule,
    EmployeesModule,
    AuthModule,
  ],
})
export class AppModule {}
