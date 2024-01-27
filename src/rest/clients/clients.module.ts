import { Module } from '@nestjs/common'
import { ClientsService } from './clients.service'
import { ClientsController } from './clients.controller'
import { ClientMapper } from './client-mapper/client-mapper'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Client } from './entities/client.entity'
import { CacheModule } from '@nestjs/cache-manager'

@Module({
  controllers: [ClientsController],
  imports: [TypeOrmModule.forFeature([Client]), CacheModule.register()],
  providers: [ClientsService, ClientMapper],
})
export class ClientsModule {}
