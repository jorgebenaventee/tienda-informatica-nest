import { Module } from '@nestjs/common'
import { SuppliersService } from './services/suppliers.service'
import { SuppliersController } from './controllers/suppliers.controller'

@Module({
  controllers: [SuppliersController],
  providers: [SuppliersService],
})
export class SuppliersModule {}
