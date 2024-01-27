import { Test, TestingModule } from '@nestjs/testing'
import { EmployeesController } from './employees.controller'
import { EmployeesService } from '../services/employees.service'
import { CacheModule } from '@nestjs/cache-manager'
import { ResponseEmployeeDto } from '../dto/response-employee.dto'
import { Paginated } from 'nestjs-paginate'

describe('EmployeesController', () => {
  let controller: EmployeesController
  let service: EmployeesService

  const mockEmployeesService = {
    findAll: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [CacheModule.register()],
      controllers: [EmployeesController],
      providers: [
        {
          provide: EmployeesService,
          useValue: mockEmployeesService,
        },
      ],
    }).compile()

    service = module.get<EmployeesService>(EmployeesService)
    controller = module.get<EmployeesController>(EmployeesController)
  })

  it('should be defined', () => {
    expect(controller).toBeDefined()
  })

  describe('findAll', () => {
    it('should return an array of employees', async () => {
      const paginatedOptions = {
        page: 1,
        limit: 10,
        path: 'employees',
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
          current: 'http://localhost:3000/employees?page=1',
        },
      } as Paginated<ResponseEmployeeDto>

      jest.spyOn(service, 'findAll').mockResolvedValueOnce(page)

      const result: any = await controller.findAll(paginatedOptions)

      expect(result.meta.itemsPerPage).toEqual(paginatedOptions.limit)
      expect(result.meta.currentPage).toEqual(paginatedOptions.page)
      expect(result.meta.totalPages).toEqual(1)
      expect(result.links.current).toEqual(
        `http://localhost:3000/api/${paginatedOptions.path}?page=${paginatedOptions.page}&limit=${paginatedOptions.limit}`,
      )
      expect(service.findAll).toHaveBeenCalled()
    })
  })
})
