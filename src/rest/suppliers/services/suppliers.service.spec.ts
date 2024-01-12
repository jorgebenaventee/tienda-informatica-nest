import { Test, TestingModule } from '@nestjs/testing'
import { SuppliersService } from './suppliers.service'
import { Supplier } from '../entities/supplier.entity'
import { Repository } from 'typeorm'
import { Category } from '../../category/entities/category.entity'
import { SupplierMapper } from '../mappers/supplier-mapper'
import { getRepositoryToken } from '@nestjs/typeorm'
import { ResponseSupplierDto } from '../dto/response-supplier.dto'
import { NotFoundException } from '@nestjs/common'
import { CreateSupplierDto } from '../dto/create-supplier.dto'
import { UpdateSupplierDto } from '../dto/update-supplier.dto'

describe('SuppliersService', () => {
  let service: SuppliersService
  let suppliersRepository: Repository<Supplier>
  let categoryRepository: Repository<Category>
  let mapper: SupplierMapper

  const mapperMock = {
    toDto: jest.fn(),
    toEntity: jest.fn(),
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SuppliersService,
        { provide: getRepositoryToken(Supplier), useClass: Repository },
        { provide: getRepositoryToken(Category), useClass: Repository },
        { provide: SupplierMapper, useValue: mapperMock },
      ],
    }).compile()

    service = module.get<SuppliersService>(SuppliersService)
    suppliersRepository = module.get<Repository<Supplier>>(
      getRepositoryToken(Supplier),
    )
    categoryRepository = module.get<Repository<Category>>(
      getRepositoryToken(Category),
    )
    mapper = module.get<SupplierMapper>(SupplierMapper)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })
  describe('findAll', () => {
    it('should return an array of suppliers', async () => {
      const supplierResponseDto: ResponseSupplierDto[] = []
      const mockQuery = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(supplierResponseDto),
      }
      jest
        .spyOn(suppliersRepository, 'createQueryBuilder')
        .mockReturnValue(mockQuery as any)

      jest.spyOn(mapper, 'toDto').mockReturnValue(supplierResponseDto[0])

      const result = await service.findAll()
      expect(result).toEqual(supplierResponseDto)
    })
  })
  describe('findOne', () => {
    it('should return a supplier', async () => {
      const supplierResponseDto: ResponseSupplierDto = {
        id: '3c34de0e-ffb9-4f26-9264-b1673ad35b03',
        name: 'supplier',
        contact: 1,
        address: 'address',
        hired_at: new Date(),
        category: 'category',
        is_deleted: false,
      }
      const mockQuery = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(supplierResponseDto),
      }
      jest
        .spyOn(suppliersRepository, 'createQueryBuilder')
        .mockReturnValue(mockQuery as any)

      jest.spyOn(mapper, 'toDto').mockReturnValue(supplierResponseDto)

      const result = await service.findOne(
        '3c34de0e-ffb9-4f26-9264-b1673ad35b03',
      )
      expect(result).toEqual(supplierResponseDto)
    })
    it('should throw a NotFoundException', async () => {
      const mockQuery = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(undefined),
      }
      jest
        .spyOn(suppliersRepository, 'createQueryBuilder')
        .mockReturnValue(mockQuery as any)
      const result = service.findOne('3c34de0e-ffb9-4f26-9264-b1673ad35b03')
      await expect(result).rejects.toThrow(NotFoundException)
    })
  })
  describe('create', () => {
    it('should create a supplier', async () => {
      const createSupplierDto: CreateSupplierDto = {
        name: 'supplier',
        contact: 1,
        address: 'address',
        hired_at: new Date(),
        category: 'category',
        is_deleted: false,
      }
      const mockCategory = new Category()
      const mockSupplier = new Supplier()
      const supplierReponseDto = new ResponseSupplierDto()

      jest.spyOn(service, 'checkCategory').mockResolvedValue(mockCategory)
      jest.spyOn(mapper, 'toEntity').mockReturnValue(mockSupplier)
      jest.spyOn(suppliersRepository, 'save').mockResolvedValue(mockSupplier)
      jest.spyOn(mapper, 'toDto').mockReturnValue(supplierReponseDto)

      const result = await service.create(createSupplierDto)
      expect(result).toEqual(supplierReponseDto)
    })
    it('should throw a BadRequest name emtpy', async () => {
      const createSupplierDto: CreateSupplierDto = {
        name: '',
        contact: 1,
        address: 'address',
        hired_at: new Date(),
        category: 'category',
        is_deleted: false,
      }
      const result = service.create(createSupplierDto)
      await expect(result).rejects.toThrow(TypeError)
    })
    it('should throw a BadRequest contact emtpy', async () => {
      const createSupplierDto: CreateSupplierDto = {
        name: 'supplier',
        contact: undefined,
        address: 'address',
        hired_at: new Date(),
        category: 'category',
        is_deleted: false,
      }
      const result = service.create(createSupplierDto)
      await expect(result).rejects.toThrow(TypeError)
    })
    it('should throw a BadRequest address emtpy', async () => {
      const createSupplierDto: CreateSupplierDto = {
        name: 'supplier',
        contact: 1,
        address: '',
        hired_at: new Date(),
        category: 'category',
        is_deleted: false,
      }
      const result = service.create(createSupplierDto)
      await expect(result).rejects.toThrow(TypeError)
    })
    it('should throw a BadRequest hired_at emtpy', async () => {
      const createSupplierDto: CreateSupplierDto = {
        name: 'supplier',
        contact: 1,
        address: 'address',
        hired_at: undefined,
        category: 'category',
        is_deleted: false,
      }
      const result = service.create(createSupplierDto)
      await expect(result).rejects.toThrow(TypeError)
    })
    it('should throw a BadRequest category emtpy', async () => {
      const createSupplierDto: CreateSupplierDto = {
        name: 'supplier',
        contact: 1,
        address: 'address',
        hired_at: new Date(),
        category: '',
        is_deleted: false,
      }
      const result = service.create(createSupplierDto)
      await expect(result).rejects.toThrow(TypeError)
    })
    it('should throw a BadRequest is_deleted emtpy', async () => {
      const createSupplierDto: CreateSupplierDto = {
        name: 'supplier',
        contact: 1,
        address: 'address',
        hired_at: new Date(),
        category: 'category',
        is_deleted: undefined,
      }
      const result = service.create(createSupplierDto)
      await expect(result).rejects.toThrow(TypeError)
    })
  })
  describe('update', () => {
    it('should update a supplier', async () => {
      const updateSupplierDto: UpdateSupplierDto = {
        name: 'supplier',
      }
      const supplier = new Supplier()
      const category = new Category()
      const supplierResponseDto = new ResponseSupplierDto()
      const mockQuery = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(supplier),
      }
      jest
        .spyOn(suppliersRepository, 'createQueryBuilder')
        .mockReturnValue(mockQuery as any)
      jest.spyOn(service, 'checkCategory').mockResolvedValue(category)
      jest.spyOn(suppliersRepository, 'save').mockResolvedValue(supplier)
      jest.spyOn(mapper, 'toDto').mockReturnValue(supplierResponseDto)

      const result = await service.update(
        '3c34de0e-ffb9-4f26-9264-b1673ad35b03',
        updateSupplierDto,
      )
      expect(result).toEqual(supplierResponseDto)
    })
    it('should throw a NotFoundException', async () => {
      const updateSupplierDto: UpdateSupplierDto = {
        name: 'supplier',
        contact: 1,
        address: 'address',
        hired_at: new Date(),
        category: 'category',
        is_deleted: false,
      }
      const mockQuery = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(undefined),
      }
      jest
        .spyOn(suppliersRepository, 'createQueryBuilder')
        .mockReturnValue(mockQuery as any)
      const result = service.update(
        '3c34de0e-ffb9-4f26-9264-b1673ad35b03',
        updateSupplierDto,
      )
      await expect(result).rejects.toThrow(NotFoundException)
    })
    it('should throw a BadRequest name emtpy', async () => {
      const updateSupplierDto: UpdateSupplierDto = {
        name: '',
      }
      const result = service.update(
        '3c34de0e-ffb9-4f26-9264-b1673ad35b03',
        updateSupplierDto,
      )
      await expect(result).rejects.toThrow(TypeError)
    })
    it('should throw a BadRequest contact emtpy', async () => {
      const updateSupplierDto: UpdateSupplierDto = {
        contact: undefined,
      }
      const result = service.update(
        '3c34de0e-ffb9-4f26-9264-b1673ad35b03',
        updateSupplierDto,
      )
      await expect(result).rejects.toThrow(TypeError)
    })
    it('should throw a BadRequest address emtpy', async () => {
      const updateSupplierDto: UpdateSupplierDto = {
        address: '',
      }
      const result = service.update(
        '3c34de0e-ffb9-4f26-9264-b1673ad35b03',
        updateSupplierDto,
      )
      await expect(result).rejects.toThrow(TypeError)
    })
    it('should throw a BadRequest hired_at emtpy', async () => {
      const updateSupplierDto: UpdateSupplierDto = {
        hired_at: undefined,
      }
      const result = service.update(
        '3c34de0e-ffb9-4f26-9264-b1673ad35b03',
        updateSupplierDto,
      )
      await expect(result).rejects.toThrow(TypeError)
    })
  })
  describe('remove', () => {
    it('should remove a supplier', async () => {
      const supplier = new Supplier()
      const supplierResponseDto = new ResponseSupplierDto()
      const mockQuery = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(supplier),
      }
      jest
        .spyOn(suppliersRepository, 'createQueryBuilder')
        .mockReturnValue(mockQuery as any)
      jest.spyOn(suppliersRepository, 'save').mockResolvedValue(supplier)
      jest.spyOn(mapper, 'toDto').mockReturnValue(supplierResponseDto)
    })
    it('should throw a NotFoundException', async () => {
      const mockQuery = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(undefined),
      }
      jest
        .spyOn(suppliersRepository, 'createQueryBuilder')
        .mockReturnValue(mockQuery as any)
      await expect(
        service.remove('3c34de0e-ffb9-4f26-9264-b1673ad35b03'),
      ).rejects.toThrow(NotFoundException)
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
})
