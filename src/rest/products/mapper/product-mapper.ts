import { Injectable } from '@nestjs/common'
import { CreateProductDto } from '../dto/create-product.dto'
import { Category } from '../../category/entities/category.entity'
import { Product } from '../entities/product.entity'
import { plainToClass } from 'class-transformer'
import { ResponseProductDto } from '../dto/response-product.dto'
import { Supplier } from '../../suppliers/entities/supplier.entity'

@Injectable()
export class ProductMapper {
  toEntity(
    createProductDto: CreateProductDto,
    category: Category,
    supplier: Supplier,
  ): Product {
    const product = plainToClass(Product, createProductDto)
    product.category = category
    product.supplier = supplier
    return product
  }

  toDto(product: Product): ResponseProductDto {
    const responseProductDto = plainToClass(ResponseProductDto, product)
    if (product.category && product.category.name) {
      responseProductDto.category = product.category.name
    }
    if (product.supplier && product.supplier.id) {
      responseProductDto.supplier = product.supplier.id
    }
    return responseProductDto
  }
}
