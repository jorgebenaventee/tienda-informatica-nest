import { Test, TestingModule } from '@nestjs/testing'
import { ProductsController } from './products.controller'
import { ProductsService } from '../services/products.service'
import { ResponseProductDto } from '../dto/response-product.dto'
import { NotFoundException } from '@nestjs/common'
import { CreateProductDto } from '../dto/create-product.dto'
import { UpdateProductDto } from '../dto/update-product.dto'
import { CacheModule } from '@nestjs/cache-manager'
import { Paginated } from 'nestjs-paginate'

describe('ProductsController', () => {
  let controller: ProductsController
  let service: ProductsService

  const productServiceMock = {
    findAll: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    removeSoft: jest.fn(),
    updateImage: jest.fn(),
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [CacheModule.register()],
      controllers: [ProductsController],
      providers: [
        {
          provide: ProductsService,
          useValue: productServiceMock,
        },
      ],
    }).compile()

    controller = module.get<ProductsController>(ProductsController)
    service = module.get<ProductsService>(ProductsService)
  })

  it('should be defined', () => {
    expect(controller).toBeDefined()
  })
  describe('findAll', () => {
    it('should return an array of products', async () => {
      const paginateOptions = {
        page: 1,
        limit: 3,
        path: 'products',
      }
      const page: any = {
        data: [],
        meta: {
          itemsPerPage: 3,
          totalItems: 0,
          currentPage: 1,
          totalPages: 0,
        },
        links: {
          current:
            'http://localhost:3000/api/products?page=1&limit=3&sortBy=id:ASC',
        },
      } as Paginated<ResponseProductDto>
      jest.spyOn(service, 'findAll').mockResolvedValue(page)
      const result: any = await controller.findAll(paginateOptions)

      expect(result.meta.totalPages).toEqual(0)
      expect(service.findAll).toHaveBeenCalled()
    })
  })
  describe('findOne', () => {
    it('should return a product', async () => {
      const id = 'uuid'
      const result: ResponseProductDto = new ResponseProductDto()
      jest.spyOn(service, 'findOne').mockResolvedValue(result)
      await controller.findOne(id)
      expect(service.findOne).toHaveBeenCalledWith(id)
      expect(result).toBeInstanceOf(ResponseProductDto)
    })
    it('should throw a NotFoundException', async () => {
      const id = 'uuid'
      jest.spyOn(service, 'findOne').mockRejectedValue(new NotFoundException())
      await expect(controller.findOne(id)).rejects.toThrow(NotFoundException)
    })
  })
  describe('create', () => {
    it('should create a product', async () => {
      const createProductDto: CreateProductDto = {
        name: 'Computer',
        weight: 10,
        price: 100,
        image: 'image.png',
        stock: 10,
        description: 'description',
        isDeleted: false,
        category: 'category',
        supplier: 'supplier',
      }
      const result: ResponseProductDto = new ResponseProductDto()
      jest.spyOn(service, 'create').mockResolvedValue(result)
      await controller.create(createProductDto)
      expect(service.create).toHaveBeenCalledWith(createProductDto)
      expect(result).toBeInstanceOf(ResponseProductDto)
    })
  })
  describe('update', () => {
    it('should update a product', async () => {
      const id = 'uuid'
      const updateProductDto: UpdateProductDto = {
        name: 'Computer',
        weight: 10,
        price: 100,
        isDeleted: false,
        category: 'category',
      }
      const result: ResponseProductDto = new ResponseProductDto()
      jest.spyOn(service, 'update').mockResolvedValue(result)
      await controller.update(id, updateProductDto)
      expect(service.update).toHaveBeenCalledWith(id, updateProductDto)
      expect(result).toBeInstanceOf(ResponseProductDto)
    })
  })
  describe('removeSoft', () => {
    it('should delete a product', async () => {
      const id = 'uuid'
      const result = new ResponseProductDto()
      jest.spyOn(service, 'removeSoft').mockResolvedValue(result)
      await controller.remove(id)
      expect(service.removeSoft).toHaveBeenCalledWith(id)
      expect(result).toBeInstanceOf(ResponseProductDto)
    })
    it('should throw a NotFoundException', async () => {
      const id = 'uuid'
      jest
        .spyOn(service, 'removeSoft')
        .mockRejectedValue(new NotFoundException())
      await expect(controller.remove(id)).rejects.toThrow(NotFoundException)
    })
  })
})
