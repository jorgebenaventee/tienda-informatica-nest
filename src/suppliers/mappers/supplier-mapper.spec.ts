import { Test, TestingModule } from '@nestjs/testing'
import { SupplierMapper } from './supplier-mapper'
import { Category } from '../../category/entities/category.entity'
import { CreateSupplierDto } from '../dto/create-supplier.dto'
import { Supplier } from '../entities/supplier.entity'
import { ResponseSupplierDto } from '../dto/response-supplier.dto'

describe('Mappers', () => {
  let provider: SupplierMapper

  const category: Category = {
    id: 'uuid',
    name: 'PC',
    createdAt: new Date(),
    updatedAt: new Date(),
    isActive: true,
    products: [],
    suppliers: [],
  }

  const createSupplierDto: CreateSupplierDto = {
    name: 'supplier',
    contact: 1,
    address: 'address',
    hired_at: new Date(),
    category: 'category',
    is_deleted: false,
  }

  const supplier = {
    id: 'uuid',
    name: 'supplier',
    contact: 1,
    address: 'address',
    hired_at: new Date(),
    category: category,
    is_deleted: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    products: [],
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SupplierMapper],
    }).compile()

    provider = module.get<SupplierMapper>(SupplierMapper)
  })

  it('should be defined', () => {
    expect(provider).toBeDefined()
  })
  it('should map to entity', () => {
    const actualSupplier = provider.toEntity(createSupplierDto, category)
    expect(actualSupplier).toBeInstanceOf(Supplier)
  })
  it('should map to dto', () => {
    const actualSupplier = provider.toDto(supplier)
    expect(actualSupplier).toBeInstanceOf(ResponseSupplierDto)
  })
})
