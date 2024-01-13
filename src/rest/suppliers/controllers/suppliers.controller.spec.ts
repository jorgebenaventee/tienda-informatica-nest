import { Test, TestingModule } from '@nestjs/testing'
import { SuppliersController } from './suppliers.controller'
import { SuppliersService } from '../services/suppliers.service'
import { ResponseSupplierDto } from '../dto/response-supplier.dto'
import { NotFoundException } from '@nestjs/common'
import { CreateSupplierDto } from '../dto/create-supplier.dto'
import { UpdateSupplierDto } from '../dto/update-supplier.dto'
import { Paginated } from 'nestjs-paginate'
import { CacheModule } from '@nestjs/cache-manager'

describe('SuppliersController', () => {
  let controller: SuppliersController
  let service: SuppliersService

  const suppliersServiceMock = {
    findAll: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [CacheModule.register()],
      controllers: [SuppliersController],
      providers: [
        {
          provide: SuppliersService,
          useValue: suppliersServiceMock,
        },
      ],
    }).compile()

    controller = module.get<SuppliersController>(SuppliersController)
    service = module.get<SuppliersService>(SuppliersService)
  })

  it('should be defined', () => {
    expect(controller).toBeDefined()
  })

  describe('findAll', () => {
    it('should return a page of suppliers', async () => {
      const paginateOptions = {
        page: 1,
        limit: 10,
        path: 'suppliers',
      }
      const page: any = {
        data: [],
        meta: {
          itemsPerPage: 10,
          totalItems: 1,
          totalPages: 1,
          currentPage: 1,
        },
        links: {
          current: 'http://localhost:3000/api/suppliers?page=1&limit=10',
        },
      } as Paginated<ResponseSupplierDto>

      jest.spyOn(service, 'findAll').mockResolvedValue(page)
      const result: any = await controller.findAll(paginateOptions)

      expect(result.meta.itemsPerPage).toEqual(paginateOptions.limit)
      expect(result.meta.currentPage).toEqual(paginateOptions.page)
      expect(result.meta.totalPages).toEqual(1)
      expect(result.links.current).toEqual(
        `http://localhost:3000/api/${paginateOptions.path}?page=${paginateOptions.page}&limit=${paginateOptions.limit}`,
      )
      expect(service.findAll).toHaveBeenCalled()
    })
  })
  describe('findOne', () => {
    it('should return a supplier', async () => {
      const id = '3c34de0e-ffb9-4f26-9264-b1673ad35b03'
      const result: ResponseSupplierDto = new ResponseSupplierDto()
      jest.spyOn(service, 'findOne').mockResolvedValue(result)
      await controller.findOne(id)
      expect(service.findOne).toHaveBeenCalledWith(id)
      expect(result).toBeInstanceOf(ResponseSupplierDto)
    })
    it('should throw a NotFoundException', async () => {
      const id = '3c34de0e-ffb9-4f26-9264-b1673ad35b03'
      jest.spyOn(service, 'findOne').mockRejectedValue(new NotFoundException())
      await expect(controller.findOne(id)).rejects.toThrow(NotFoundException)
    })
  })
  describe('create', () => {
    it('should return a supplier', async () => {
      const supplier: CreateSupplierDto = {
        name: 'Computer',
        contact: 123456789,
        address: 'Jl. Raya',
        hired_at: new Date(),
        category: 'IT',
        is_deleted: false,
      }
      const result: ResponseSupplierDto = new ResponseSupplierDto()
      jest.spyOn(service, 'create').mockResolvedValue(result)
      await controller.create(supplier)
      expect(service.create).toHaveBeenCalledWith(supplier)
      expect(result).toBeInstanceOf(ResponseSupplierDto)
    })
    it('should throw a BadRequestException name empty', async () => {
      const supplier: CreateSupplierDto = {
        name: '',
        contact: 123456789,
        address: 'Jl. Raya',
        hired_at: new Date(),
        category: 'IT',
        is_deleted: false,
      }
      jest.spyOn(service, 'create').mockRejectedValue(new Error())
      await expect(controller.create(supplier)).rejects.toThrow(Error)
    })
    it('should throw a BadRequestException contact empty', async () => {
      const supplier: CreateSupplierDto = {
        name: 'Computer',
        contact: null,
        address: 'Jl. Raya',
        hired_at: new Date(),
        category: 'IT',
        is_deleted: false,
      }
      jest.spyOn(service, 'create').mockRejectedValue(new Error())
      await expect(controller.create(supplier)).rejects.toThrow(Error)
    })
    it('should throw a BadRequestException address empty', async () => {
      const supplier: CreateSupplierDto = {
        name: 'Computer',
        contact: 123456789,
        address: '',
        hired_at: new Date(),
        category: 'IT',
        is_deleted: false,
      }
      jest.spyOn(service, 'create').mockRejectedValue(new Error())
      await expect(controller.create(supplier)).rejects.toThrow(Error)
    })
    it('should throw a BadRequestException hired_at empty', async () => {
      const supplier: CreateSupplierDto = {
        name: 'Computer',
        contact: 123456789,
        address: 'Jl. Raya',
        hired_at: null,
        category: 'IT',
        is_deleted: false,
      }
      jest.spyOn(service, 'create').mockRejectedValue(new Error())
      await expect(controller.create(supplier)).rejects.toThrow(Error)
    })
    it('should throw a BadRequestException category empty', async () => {
      const supplier: CreateSupplierDto = {
        name: 'Computer',
        contact: 123456789,
        address: 'Jl. Raya',
        hired_at: new Date(),
        category: '',
        is_deleted: false,
      }
      jest.spyOn(service, 'create').mockRejectedValue(new Error())
      await expect(controller.create(supplier)).rejects.toThrow(Error)
    })
    it('should throw a BadRequestException is_deleted empty', async () => {
      const supplier: CreateSupplierDto = {
        name: 'Computer',
        contact: 123456789,
        address: 'Jl. Raya',
        hired_at: new Date(),
        category: 'IT',
        is_deleted: null,
      }
      jest.spyOn(service, 'create').mockRejectedValue(new Error())
      await expect(controller.create(supplier)).rejects.toThrow(Error)
    })
  })
  describe('update', () => {
    it('should return a supplier', async () => {
      const id = '3c34de0e-ffb9-4f26-9264-b1673ad35b03'
      const supplier: UpdateSupplierDto = {
        name: 'Computer',
        contact: 123456789,
        address: 'Jl. Raya',
        hired_at: new Date(),
        category: 'IT',
        is_deleted: false,
      }
      const result: ResponseSupplierDto = new ResponseSupplierDto()
      jest.spyOn(service, 'update').mockResolvedValue(result)
      await controller.update(id, supplier)
      expect(service.update).toHaveBeenCalledWith(id, supplier)
      expect(result).toBeInstanceOf(ResponseSupplierDto)
    })
    it('should throw a BadRequestException name empty', async () => {
      const id = '3c34de0e-ffb9-4f26-9264-b1673ad35b03'
      const supplier: UpdateSupplierDto = {
        name: '',
        contact: 123456789,
        address: 'Jl. Raya',
        hired_at: new Date(),
        category: 'IT',
        is_deleted: false,
      }
      jest.spyOn(service, 'update').mockRejectedValue(new Error())
      await expect(controller.update(id, supplier)).rejects.toThrow(Error)
    })
    it('should throw a BadRequestException contact empty', async () => {
      const id = '3c34de0e-ffb9-4f26-9264-b1673ad35b03'
      const supplier: UpdateSupplierDto = {
        name: 'Computer',
        contact: null,
        address: 'Jl. Raya',
        hired_at: new Date(),
        category: 'IT',
        is_deleted: false,
      }
      jest.spyOn(service, 'update').mockRejectedValue(new Error())
      await expect(controller.update(id, supplier)).rejects.toThrow(Error)
    })
    it('should throw a BadRequestException address empty', async () => {
      const id = '3c34de0e-ffb9-4f26-9264-b1673ad35b03'
      const supplier: UpdateSupplierDto = {
        name: 'Computer',
        contact: 123456789,
        address: '',
        hired_at: new Date(),
        category: 'IT',
        is_deleted: false,
      }
      jest.spyOn(service, 'update').mockRejectedValue(new Error())
      await expect(controller.update(id, supplier)).rejects.toThrow(Error)
    })
    it('should throw a BadRequestException hired_at empty', async () => {
      const id = '3c34de0e-ffb9-4f26-9264-b1673ad35b03'
      const supplier: UpdateSupplierDto = {
        name: 'Computer',
        contact: 123456789,
        address: 'Jl. Raya',
        hired_at: null,
        category: 'IT',
        is_deleted: false,
      }
      jest.spyOn(service, 'update').mockRejectedValue(new Error())
      await expect(controller.update(id, supplier)).rejects.toThrow(Error)
    })
    it('should throw a BadRequestException category empty', async () => {
      const id = '3c34de0e-ffb9-4f26-9264-b1673ad35b03'
      const supplier: UpdateSupplierDto = {
        name: 'Computer',
        contact: 123456789,
        address: 'Jl. Raya',
        hired_at: new Date(),
        category: '',
        is_deleted: false,
      }
      jest.spyOn(service, 'update').mockRejectedValue(new Error())
      await expect(controller.update(id, supplier)).rejects.toThrow(Error)
    })
    it('should throw a BadRequestException is_deleted empty', async () => {
      const id = '3c34de0e-ffb9-4f26-9264-b1673ad35b03'
      const supplier: UpdateSupplierDto = {
        name: 'Computer',
        contact: 123456789,
        address: 'Jl. Raya',
        hired_at: new Date(),
        category: 'IT',
        is_deleted: null,
      }
      jest.spyOn(service, 'update').mockRejectedValue(new Error())
      await expect(controller.update(id, supplier)).rejects.toThrow(Error)
    })
  })

  describe('remove', () => {
    it('should remove a supplier', async () => {
      const id = '3c34de0e-ffb9-4f26-9264-b1673ad35b03'
      jest.spyOn(service, 'remove').mockResolvedValue(undefined)
      await controller.remove(id)
      expect(service.remove).toHaveBeenCalledWith(id)
    })

    it('should throw an error if supplier not found', async () => {
      const id = '3c34de0e-ffb9-4f26-9264-b1673ad35b03'
      jest.spyOn(service, 'remove').mockRejectedValue(new NotFoundException())
      await expect(controller.remove(id)).rejects.toThrow(NotFoundException)
    })
  })
})
