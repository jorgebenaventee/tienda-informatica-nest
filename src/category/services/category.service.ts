import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common'
import { CreateCategoryDto } from '../dto/create-category.dto'
import { UpdateCategoryDto } from '../dto/update-category.dto'
import { Repository } from 'typeorm'
import { Category } from '../entities/category.entity'
import { InjectRepository } from '@nestjs/typeorm'
import { CategoryMapper } from '../mapper/category-mapper'

@Injectable()
export class CategoryService {
  private logger = new Logger('CategoryService')

  constructor(
    private readonly categoryMapper: CategoryMapper,
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
  ) {
  }

  async findAll() {
    this.logger.log('Searching all categories')
    return await this.categoryRepository.find()
  }

  async findOne(id: string) {
    this.logger.log(`Find one category with id ${id}`)
    const category = await this.categoryRepository.findOneBy({ id })
    if (!category) {
      throw new NotFoundException(`Category #${id} not found`)
    }
    return category
  }

  async create(createCategoryDto: CreateCategoryDto) {
    this.logger.log('Creating a new category')
    const category = this.categoryMapper.toEntity(createCategoryDto)
    const categoryCreated = await this.categoryExists(category.name)
    return await this.categoryRepository.save(categoryCreated)
  }

  async update(id: string, updateCategoryDto: UpdateCategoryDto) {
    this.logger.log(`Updating category with id ${id}`)
    const category = this.categoryMapper.toEntity(updateCategoryDto)
    const categoryUpdated = await this.categoryExists(category.name)
    if (!categoryUpdated) {
      return await this.categoryRepository.save({
        ...category,
        id,
      })
    }
  }

  async remove(id: string) {
    const category = await this.categoryExists(id)
    if (!category) {
      throw new NotFoundException(`Category #${id} not found`)
    } else {
      return await this.categoryRepository.remove(category)
    }
  }

  async removeSoft(id: string): Promise<Category> {
    const category = await this.categoryRepository.findOneBy({ id })
    if (!category) {
      throw new NotFoundException(`Category #${id} not found`)
    } else {
      return await this.categoryRepository.save({
        ...category,
        isActive: false,
      })
    }
  }

  async categoryExists(name: string): Promise<Category> {
    const category = await this.categoryRepository
      .createQueryBuilder('category')
      .where('LOWER(name) = LOWER(:name)', { name })
      .getOne()
    if (!category) {
      const newCategory = new Category()
      newCategory.name = name
      newCategory.isActive = true
      return await this.categoryRepository.save(newCategory)
    } else if (category) {
      if (category.isActive === true) {
        throw new BadRequestException(`Category ${name} already exists`)
      } else if (category.isActive === false) {
        category.isActive = true
        return await this.categoryRepository.save(category)
      }
    }
  }
}
