import { Test, TestingModule } from '@nestjs/testing'
import { ProductsService } from './products.service'
import { Repository } from 'typeorm'
import { Product } from '../entities/product.entity'
import { Category } from '../../category/entities/category.entity'
import { ProductMapper } from '../mapper/product-mapper'
import { getRepositoryToken } from '@nestjs/typeorm'
import { ResponseProductDto } from '../dto/response-product.dto'
import { NotFoundException } from '@nestjs/common'
import { CreateProductDto } from '../dto/create-product.dto'
import { UpdateProductDto } from '../dto/update-product.dto'
import { Supplier } from '../../suppliers/entities/supplier.entity'

describe('ProductsService', () => {
  let service: ProductsService
  let productsRepository: Repository<Product>
  let categoryRepository: Repository<Category>
  let supplierRepository: Repository<Supplier>
  let mapper: ProductMapper

  const mapperMock = {
    toDto: jest.fn(),
    toEntity: jest.fn(),
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        { provide: getRepositoryToken(Product), useClass: Repository },
        { provide: getRepositoryToken(Category), useClass: Repository },
        { provide: getRepositoryToken(Supplier), useClass: Repository },
        { provide: ProductMapper, useValue: mapperMock },
      ],
    }).compile()

    service = module.get<ProductsService>(ProductsService)
    productsRepository = module.get<Repository<Product>>(
      getRepositoryToken(Product),
    )
    categoryRepository = module.get<Repository<Category>>(
      getRepositoryToken(Category),
    )
    supplierRepository = module.get<Repository<Supplier>>(
      getRepositoryToken(Supplier),
    )
    mapper = module.get<ProductMapper>(ProductMapper)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })
  describe('findAll', () => {
    it('should return an array of products', async () => {
      const productResponseDto: ResponseProductDto[] = []
      const mockQuery = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(productResponseDto),
      }
      jest
        .spyOn(productsRepository, 'createQueryBuilder')
        .mockReturnValue(mockQuery as any)

      jest.spyOn(mapper, 'toDto').mockReturnValue(productResponseDto[0])
      expect(await service.findAll()).toEqual(productResponseDto)
    })
  })
  describe('findOne', () => {
    it('should return a product', async () => {
      const productResponseDto = new ResponseProductDto()
      const mockQuery = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(productResponseDto),
      }
      jest
        .spyOn(productsRepository, 'createQueryBuilder')
        .mockReturnValue(mockQuery as any)

      jest.spyOn(mapper, 'toDto').mockReturnValue(productResponseDto)
      expect(await service.findOne('uuid')).toEqual(productResponseDto)
    })
    it('should throw a NotFoundException', async () => {
      const mockQuery = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(undefined),
      }
      jest
        .spyOn(productsRepository, 'createQueryBuilder')
        .mockReturnValue(mockQuery as any)
      await expect(service.findOne('uuid')).rejects.toThrow(NotFoundException)
    })
  })
  describe('create', () => {
    it('should create a product', async () => {
      const createProductDto = new CreateProductDto()
      const category = new Category()
      const product = new Product()
      const supplier = new Supplier()
      const productResponseDto = new ResponseProductDto()

      jest.spyOn(service, 'checkCategory').mockResolvedValue(category)
      jest.spyOn(service, 'checkSupplier').mockResolvedValue(supplier)
      jest.spyOn(mapper, 'toEntity').mockReturnValue(product)
      jest.spyOn(productsRepository, 'save').mockResolvedValue(product)
      jest.spyOn(mapper, 'toDto').mockReturnValue(productResponseDto)

      expect(await service.create(createProductDto)).toEqual(productResponseDto)
    })
    it('should throw a BadRequest because of empty name', async () => {
      const createProductDto = new CreateProductDto()
      createProductDto.name = ''
      await expect(service.create(createProductDto)).rejects.toThrow(TypeError)
    })
    it('should throw a BadRequest because of empty price', async () => {
      const createProductDto = new CreateProductDto()
      createProductDto.price = undefined
      await expect(service.create(createProductDto)).rejects.toThrow(TypeError)
    })
    it('should throw a BadRequest because of empty category', async () => {
      const createProductDto = new CreateProductDto()
      createProductDto.category = ''
      await expect(service.create(createProductDto)).rejects.toThrow(TypeError)
    })
    it('should throw a BadRequest because of empty supplier', async () => {
      const createProductDto = new CreateProductDto()
      createProductDto.supplier = ''
      await expect(service.create(createProductDto)).rejects.toThrow(TypeError)
    })
    it('should throw a BadRequest because of empty weight', async () => {
      const createProductDto = new CreateProductDto()
      createProductDto.weight = undefined
      await expect(service.create(createProductDto)).rejects.toThrow(TypeError)
    })
    it('should throw a BadRequest because of empty stock', async () => {
      const createProductDto = new CreateProductDto()
      createProductDto.stock = undefined
      await expect(service.create(createProductDto)).rejects.toThrow(TypeError)
    })
    it('should throw a BadRequest because of empty description', async () => {
      const createProductDto = new CreateProductDto()
      createProductDto.description = ''
      await expect(service.create(createProductDto)).rejects.toThrow(TypeError)
    })
  })
  describe('update', () => {
    it('should update a product', async () => {
      const updateProductDto = new UpdateProductDto()
      const product = new Product()
      const category = new Category()
      const productResponseDto = new ResponseProductDto()
      const mockQuery = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(product),
      }
      jest
        .spyOn(productsRepository, 'createQueryBuilder')
        .mockReturnValue(mockQuery as any)
      jest.spyOn(service, 'checkCategory').mockResolvedValue(category)
      jest.spyOn(productsRepository, 'save').mockResolvedValue(product)
      jest.spyOn(mapper, 'toDto').mockReturnValue(productResponseDto)

      expect(await service.update('uuid', updateProductDto)).toEqual(
        productResponseDto,
      )
    })
    it('should throw a BadRequest because of empty name', async () => {
      const updateProductDto = new UpdateProductDto()
      updateProductDto.name = ''
      await expect(service.update('uuid', updateProductDto)).rejects.toThrow(
        TypeError,
      )
    })
    it('should throw a BadRequest because of empty price', async () => {
      const updateProductDto = new UpdateProductDto()
      updateProductDto.price = undefined
      await expect(service.update('uuid', updateProductDto)).rejects.toThrow(
        TypeError,
      )
    })
    it('should throw a BadRequest because of empty category', async () => {
      const updateProductDto = new UpdateProductDto()
      updateProductDto.category = ''
      await expect(service.update('uuid', updateProductDto)).rejects.toThrow(
        TypeError,
      )
    })
    it('should throw a BadRequest because of empty supplier', async () => {
      const updateProductDto = new UpdateProductDto()
      updateProductDto.supplier = ''
      await expect(service.update('uuid', updateProductDto)).rejects.toThrow(
        TypeError,
      )
    })
    it('should throw a BadRequest because of empty weight', async () => {
      const updateProductDto = new UpdateProductDto()
      updateProductDto.weight = undefined
      await expect(service.update('uuid', updateProductDto)).rejects.toThrow(
        TypeError,
      )
    })
    it('should throw a BadRequest because of empty stock', async () => {
      const updateProductDto = new UpdateProductDto()
      updateProductDto.stock = undefined
      await expect(service.update('uuid', updateProductDto)).rejects.toThrow(
        TypeError,
      )
    })
    it('should throw a BadRequest because of empty description', async () => {
      const updateProductDto = new UpdateProductDto()
      updateProductDto.description = ''
      await expect(service.update('uuid', updateProductDto)).rejects.toThrow(
        TypeError,
      )
    })
  })
  describe('remove', () => {
    it('should remove a product', async () => {
      const product = new Product()
      const mockQuery = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(product),
      }
      jest
        .spyOn(productsRepository, 'createQueryBuilder')
        .mockReturnValue(mockQuery as any)
      jest.spyOn(productsRepository, 'delete').mockResolvedValue(undefined)

      expect(await service.remove('uuid')).toEqual(undefined)
    })
    it('should throw a NotFoundException', async () => {
      const mockQuery = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(undefined),
      }
      jest
        .spyOn(productsRepository, 'createQueryBuilder')
        .mockReturnValue(mockQuery as any)
      await expect(service.remove('uuid')).rejects.toThrow(NotFoundException)
    })
  })
  describe('removeSoft', () => {
    it('should set isDeleted to true', async () => {
      const product = new Product()
      const productResponseDto = new ResponseProductDto()
      const mockQuery = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(product),
      }
      jest
        .spyOn(productsRepository, 'createQueryBuilder')
        .mockReturnValue(mockQuery as any)
      jest.spyOn(productsRepository, 'save').mockResolvedValue(product)
      jest.spyOn(mapper, 'toDto').mockReturnValue(productResponseDto)

      expect(await service.removeSoft('uuid')).toEqual(productResponseDto)
    })
    it('should throw a NotFoundException', async () => {
      const mockQuery = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(undefined),
      }
      jest
        .spyOn(productsRepository, 'createQueryBuilder')
        .mockReturnValue(mockQuery as any)
      await expect(service.removeSoft('uuid')).rejects.toThrow(
        NotFoundException,
      )
    })
  })
  describe('checkCategory', () => {
    it('should return a category', async () => {
      const category = new Category()
      const mockQuery = {
        where: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(category),
      }
      jest
        .spyOn(categoryRepository, 'createQueryBuilder')
        .mockReturnValue(mockQuery as any)
      expect(await service.checkCategory('PC')).toEqual(category)
    })
    it('should throw a NotFoundException', async () => {
      const mockQuery = {
        where: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(undefined),
      }
      jest
        .spyOn(categoryRepository, 'createQueryBuilder')
        .mockReturnValue(mockQuery as any)
      await expect(service.checkCategory('PC')).rejects.toThrow(
        NotFoundException,
      )
    })
  })
  describe('checkSupplier', () => {
    it('should return a supplier', async () => {
      const supplier = new Supplier()
      const mockQuery = {
        where: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(supplier),
      }
      jest
        .spyOn(supplierRepository, 'createQueryBuilder')
        .mockReturnValue(mockQuery as any)
      expect(await service.checkSupplier('uuid')).toEqual(supplier)
    })
    it('should throw a NotFoundException', async () => {
      const mockQuery = {
        where: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(undefined),
      }
      jest
        .spyOn(supplierRepository, 'createQueryBuilder')
        .mockReturnValue(mockQuery as any)
      await expect(service.checkSupplier('uuid')).rejects.toThrow(
        NotFoundException,
      )
    })
  })
})
