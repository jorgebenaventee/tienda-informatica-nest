import { Module } from '@nestjs/common'
import { CategoryService } from './services/category.service'
import { CategoryController } from './controller/category.controller'
import { CategoryMapper } from './mapper/category-mapper'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Category } from './entities/category.entity'
import { CacheModule } from '@nestjs/cache-manager'

@Module({
  controllers: [CategoryController],
  providers: [CategoryService, CategoryMapper],
  imports: [TypeOrmModule.forFeature([Category]), CacheModule.register()],
  exports: [CategoryService],
})
export class CategoryModule {}
