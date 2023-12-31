import { Injectable } from '@nestjs/common'
import { CreateProductDto } from '../dto/create-product.dto'
import { Category } from '../../category/entities/category.entity'
import { Product } from '../entities/product.entity'
import { plainToClass } from 'class-transformer'
import { ResponseProductDto } from '../dto/response-product.dto'

@Injectable()
export class ProductMapper {
  toEntity(createProductDto: CreateProductDto, category: Category): Product {
    const product = plainToClass(Product, createProductDto)
    product.category = category
    return product
  }

  toDto(product: Product): ResponseProductDto {
    const responseProductDto = plainToClass(ResponseProductDto, product)
    if (product.category && product.category.name) {
      responseProductDto.category = product.category.name
    }
    return responseProductDto
  }
}
