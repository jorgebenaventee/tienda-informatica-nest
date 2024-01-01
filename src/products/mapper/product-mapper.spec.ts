import { Test, TestingModule } from '@nestjs/testing'
import { ProductMapper } from './product-mapper'
import { Product } from '../entities/product.entity'
import { ResponseProductDto } from '../dto/response-product.dto'
import { CreateProductDto } from '../dto/create-product.dto'
import { Category } from '../../category/entities/category.entity'

describe('ProductMapper', () => {
  let mapper: ProductMapper

  const category: Category = {
    id: 'uuid',
    name: 'PC',
    createdAt: new Date(),
    updatedAt: new Date(),
    isActive: true,
    products: [],
    suppliers: [],
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
  const product: Product = {
    id: 'uuid',
    name: 'Computer',
    weight: 10,
    price: 100,
    image: 'image.png',
    stock: 10,
    description: 'description',
    isDeleted: false,
    category: category,
    createdAt: new Date(),
    updatedAt: new Date(),
    supplier: supplier,
  }
  const createProductDto: CreateProductDto = {
    name: 'Computer',
    weight: 10,
    price: 100,
    image: 'image.png',
    stock: 10,
    description: 'description',
    isDeleted: false,
    category: category.name,
    supplier: supplier.id,
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ProductMapper],
    }).compile()

    mapper = module.get<ProductMapper>(ProductMapper)
  })

  it('should be defined', () => {
    expect(mapper).toBeDefined()
  })
  it('should map dto to entity', () => {
    const actualProduct = mapper.toEntity(createProductDto, category, supplier)
    expect(actualProduct).toBeInstanceOf(Product)
  })
  it('should map entity to dto', () => {
    const actualProductDto = mapper.toDto(product)
    expect(actualProductDto).toBeInstanceOf(ResponseProductDto)
  })
})
