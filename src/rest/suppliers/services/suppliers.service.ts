import { Injectable, Logger, NotFoundException } from '@nestjs/common'
import { CreateSupplierDto } from '../dto/create-supplier.dto'
import { UpdateSupplierDto } from '../dto/update-supplier.dto'
import { SupplierMapper } from '../mappers/supplier-mapper'
import { Supplier } from '../entities/supplier.entity'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Category } from '../../category/entities/category.entity'

@Injectable()
export class SuppliersService {
  private logger = new Logger('SuppliersService ')

  constructor(
    private readonly supplierMapper: SupplierMapper,
    @InjectRepository(Supplier)
    private readonly supplierRepository: Repository<Supplier>,
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
  ) {}

  async findAll() {
    this.logger.log('Searching for all suppliers')
    const suppliers = await this.supplierRepository
      .createQueryBuilder('supplier')
      .leftJoinAndSelect('supplier.category', 'category')
      .where('supplier.is_deleted = false')
      .orderBy('supplier.id', 'ASC')
      .getMany()
    return suppliers.map((supplier) => this.supplierMapper.toDto(supplier))
  }

  async findOne(id: string) {
    this.logger.log(`Searching for supplier with id: ${id}`)
    const supplier = await this.supplierRepository
      .createQueryBuilder('supplier')
      .leftJoinAndSelect('supplier.category', 'category')
      .where('supplier.id = :id', { id })
      .getOne()
    if (!supplier) {
      throw new NotFoundException(`Supplier with id: ${id} not found`)
    } else {
      return this.supplierMapper.toDto(supplier)
    }
  }

  async create(createSupplierDto: CreateSupplierDto) {
    this.logger.log('Creating supplier')
    const category: Category = await this.checkCategory(
      createSupplierDto.category,
    )
    const supplier = this.supplierMapper.toEntity(createSupplierDto, category)
    const supplierCreated = await this.supplierRepository.save(supplier)
    return this.supplierMapper.toDto(supplierCreated)
  }

  async update(id: string, updateSupplierDto: UpdateSupplierDto) {
    this.logger.log(`Updating supplier with id: ${id}`)
    const supplier = await this.supplierRepository
      .createQueryBuilder('supplier')
      .where('supplier.id = :id and supplier.is_deleted = false', { id })
      .getOne()
    if (!supplier) {
      throw new NotFoundException(`Supplier with id: ${id} not found`)
    }
    if (updateSupplierDto.category) {
      const category: Category = await this.checkCategory(
        updateSupplierDto.category,
      )
      const supplierUpdated = await this.supplierRepository.save({
        ...supplier,
        ...updateSupplierDto,
        category,
      })
      return this.supplierMapper.toDto(supplierUpdated)
    } else {
      const supplierUpdated = await this.supplierRepository.save({
        ...supplier,
        ...updateSupplierDto,
        category: supplier.category,
      })
      return this.supplierMapper.toDto(supplierUpdated)
    }
  }

  async remove(id: string) {
    this.logger.log(`Deleting supplier with id: ${id}`)
    const supplier = await this.supplierRepository
      .createQueryBuilder('supplier')
      .where('supplier.id = :id and supplier.is_deleted = false', { id })
      .getOne()
    if (!supplier) {
      throw new NotFoundException(`Supplier with id: ${id} not found`)
    }
    const supplierDeleted = await this.supplierRepository.save({
      ...supplier,
      isDeleted: true,
    })
    return this.supplierMapper.toDto(supplierDeleted)
  }

  async checkCategory(nameCategory: string) {
    this.logger.log(`Searching for category with id: ${nameCategory}`)
    const category = await this.categoryRepository
      .createQueryBuilder('category')
      .where('category.name = :name and' + ' category.isActive = :isActive', {
        name: nameCategory,
        isActive: true,
      })
      .getOne()
    if (!category) {
      throw new NotFoundException(
        `Category with name: ${nameCategory} not found`,
      )
    }
    return category
  }
}
