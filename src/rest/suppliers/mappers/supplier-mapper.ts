import { Injectable } from '@nestjs/common'
import { CreateSupplierDto } from '../dto/create-supplier.dto'
import { Supplier } from '../entities/supplier.entity'
import { Category } from '../../category/entities/category.entity'
import { plainToClass } from 'class-transformer'
import { ResponseSupplierDto } from '../dto/response-supplier.dto'
import { UpdateSupplierDto } from '../dto/update-supplier.dto'

@Injectable()
export class SupplierMapper {
  toEntity(
    createSupplierDto: CreateSupplierDto | UpdateSupplierDto,
    category: Category,
  ): Supplier {
    const supplier = plainToClass(Supplier, createSupplierDto)
    supplier.category = category
    return supplier
  }

  toDto(supplier: Supplier): ResponseSupplierDto {
    const responseSupplierDto = plainToClass(ResponseSupplierDto, supplier)
    if (supplier.category && supplier.category.name) {
      responseSupplierDto.category = supplier.category.name
    }
    return responseSupplierDto
  }
}
