import { Injectable } from '@nestjs/common';
import { ResponseCategoryDto } from '../dto/response-category.dto';
import { CreateCategoryDto } from '../dto/create-category.dto';
import { UpdateCategoryDto } from '../dto/update-category.dto';
import { plainToClass } from 'class-transformer';
import { Category } from '../entities/category.entity';

/**
 * Clase que proporciona métodos para realizar mapeos entre objetos DTO y entidades relacionadas con la categoría.
 * Los métodos de esta clase facilitan la conversión de datos entre el formato de transferencia y el modelo de datos.
 */
@Injectable()
export class CategoryMapper {
  /**
   * Convierte un objeto de tipo CreateCategoryDto o UpdateCategoryDto a una entidad Category.
   *
   * @param createCategoryDto - Objeto DTO que contiene datos para la creación o actualización de una categoría.
   * @returns Una instancia de la entidad Category con los datos proporcionados por el DTO.
   */
  toEntity(createCategoryDto: CreateCategoryDto | UpdateCategoryDto): Category {
    const category = new Category()
    return { ...createCategoryDto, ...category }
  }

  /**
   * Convierte un objeto de tipo ResponseCategoryDto a una instancia de la clase ResponseCategoryDto.
   *
   * @param category - Objeto de tipo ResponseCategoryDto que se va a convertir.
   * @returns Una instancia de la clase ResponseCategoryDto con los datos proporcionados por el objeto original.
   */
  toDto(category: ResponseCategoryDto): ResponseCategoryDto {
    return plainToClass(ResponseCategoryDto, category)
  }
}
