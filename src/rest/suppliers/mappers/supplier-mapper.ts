import { Injectable } from '@nestjs/common'
import { CreateSupplierDto } from '../dto/create-supplier.dto'
import { Supplier } from '../entities/supplier.entity'
import { Category } from '../../category/entities/category.entity'
import { plainToClass } from 'class-transformer'
import { ResponseSupplierDto } from '../dto/response-supplier.dto'
import { UpdateSupplierDto } from '../dto/update-supplier.dto'

/**
 * Mapper class for transforming supplier data.
 * @class SupplierMapper
 */
@Injectable()
export class SupplierMapper {
  /**
   * Transforms DTO to Supplier entity.
   * @param {CreateSupplierDto | UpdateSupplierDto} createSupplierDto - Data transfer object for creating or updating a supplier.
   * @param {Category} category - Category entity.
   * @returns {Supplier} - Supplier entity.
   */
  toEntity(
    createSupplierDto: CreateSupplierDto | UpdateSupplierDto,
    category: Category,
  ): Supplier {
    const supplier = plainToClass(Supplier, createSupplierDto)
    supplier.category = category
    return supplier
  }

  /**
   * Transforms Supplier entity to DTO.
   * @param {Supplier} supplier - Supplier entity.
   * @returns {ResponseSupplierDto} - Data transfer object for supplier response.
   */
  toDto(supplier: Supplier): ResponseSupplierDto {
    const responseSupplierDto = plainToClass(ResponseSupplierDto, supplier)
    if (supplier.category && supplier.category.name) {
      responseSupplierDto.category = supplier.category.name
    }
    return responseSupplierDto
  }
}
