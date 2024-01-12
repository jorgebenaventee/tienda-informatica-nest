import { Injectable } from '@nestjs/common'
import { ResponseCategoryDto } from '../dto/response-category.dto'
import { CreateCategoryDto } from '../dto/create-category.dto'
import { UpdateCategoryDto } from '../dto/update-category.dto'
import { plainToClass } from 'class-transformer'
import { Category } from '../entities/category.entity'

@Injectable()
export class CategoryMapper {
  toEntity(createCategoryDto: CreateCategoryDto | UpdateCategoryDto): Category {
    const category = new Category()
    return { ...createCategoryDto, ...category }
  }

  toDto(category: ResponseCategoryDto): ResponseCategoryDto {
    return plainToClass(ResponseCategoryDto, category)
  }
}
