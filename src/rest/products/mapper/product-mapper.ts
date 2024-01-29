import { Injectable } from '@nestjs/common'
import { CreateProductDto } from '../dto/create-product.dto'
import { Category } from '../../category/entities/category.entity'
import { Product } from '../entities/product.entity'
import { plainToClass } from 'class-transformer'
import { ResponseProductDto } from '../dto/response-product.dto'
import { Supplier } from '../../suppliers/entities/supplier.entity'

/**
 * Servicio encargado de mapear entre objetos DTO y entidades relacionadas con productos.
 */
@Injectable()
export class ProductMapper {
  /**
   * Convierte un objeto de tipo CreateProductDto junto con una categoría y un proveedor a una entidad Product.
   *
   * @param createProductDto - Datos para la creación del producto.
   * @param category - Categoría a la que pertenece el producto.
   * @param supplier - Proveedor que suministra el producto.
   * @return Una instancia de la entidad Product creada a partir de los datos proporcionados.
   */
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

  /**
   * Convierte un objeto de tipo Product a un objeto de tipo ResponseProductDto.
   *
   * @param product - Producto a convertir.
   * @return Una instancia de ResponseProductDto creada a partir de los datos del producto.
   */
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
