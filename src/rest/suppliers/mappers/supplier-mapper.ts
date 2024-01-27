import { Injectable } from '@nestjs/common'
import { CreateSupplierDto } from '../dto/create-supplier.dto'
import { Supplier } from '../entities/supplier.entity'
import { Category } from '../../category/entities/category.entity'
import { plainToClass } from 'class-transformer'
import { ResponseSupplierDto } from '../dto/response-supplier.dto'
import { UpdateSupplierDto } from '../dto/update-supplier.dto'

/**
 * Clase EmployeesMapper para transformar los datos del proveedor.
 * @class SupplierMapper
 */
@Injectable()
export class SupplierMapper {
  /**
   * Transforma el DTO a la entidad Supplier.
   * @param {CreateSupplierDto | UpdateSupplierDto} createSupplierDto - Objeto de transferencia de datos para crear o actualizar un proveedor.
   * @param {Category} category - Entidad de la categoría.
   * @returns {Supplier} - Entidad del proveedor.
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
   * Transforma la entidad Supplier a DTO.
   * @param {Supplier} supplier - Entidad del proveedor.
   * @returns {ResponseSupplierDto} - Objeto de transferencia de datos para la respuesta del proveedor.
   */
  toDto(supplier: Supplier): ResponseSupplierDto {
    const responseSupplierDto = plainToClass(ResponseSupplierDto, supplier)
    if (supplier.category && supplier.category.name) {
      responseSupplierDto.category = supplier.category.name
    }
    return responseSupplierDto
  }
}
