import { Module } from '@nestjs/common'
import { CategoryService } from './services/category.service'
import { CategoryController } from './controller/category.controller'
import { CategoryMapper } from './mapper/category-mapper'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Category } from './entities/category.entity'

@Module({
  controllers: [CategoryController],
  providers: [CategoryService, CategoryMapper],
  imports: [TypeOrmModule.forFeature([Category])],
})
export class CategoryModule {}
