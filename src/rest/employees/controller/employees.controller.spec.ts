import { Test, TestingModule } from '@nestjs/testing'
import { EmployeesController } from './employees.controller'
import { EmployeesService } from '../services/employees.service'
import { CacheModule } from '@nestjs/cache-manager'
import { ResponseEmployeeDto } from '../dto/response-employee.dto'
import { Paginated } from 'nestjs-paginate'
import { BadRequestException, NotFoundException } from '@nestjs/common'

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
          current: 'http://localhost:3000/api/employees?page=1&limit=10',
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
  describe('findOne', () => {
    it('should return an employee', async () => {
      const result: ResponseEmployeeDto = new ResponseEmployeeDto()
      jest.spyOn(service, 'findOne').mockResolvedValueOnce(result)
      await expect(controller.findOne(1)).resolves.toEqual(result)
      expect(service.findOne).toHaveBeenCalled()
      expect(service.findOne).toHaveBeenCalledWith(1)
    })

    it('should throw NotFoundException', async () => {
      jest.spyOn(service, 'findOne').mockRejectedValue(new NotFoundException())
      await expect(controller.findOne(1)).rejects.toThrow(NotFoundException)
      expect(service.findOne).toHaveBeenCalled()
    })
  })
  describe('create', () => {
    it('should create an employee', async () => {
      const employee = {
        name: 'Test',
        salary: 1000,
        position: 'Test',
        email: 'juancarlos@gmail.com',
        password: '123456',
      }
      const result: ResponseEmployeeDto = new ResponseEmployeeDto()
      jest.spyOn(service, 'create').mockResolvedValueOnce(result)
      await controller.create(employee)
      expect(service.create).toHaveBeenCalled()
      expect(service.create).toHaveBeenCalledWith(employee)
    })
    it('should throw BadRequestException name empty', async () => {
      const employee = {
        name: 'gv',
        salary: 1000,
        position: 'Test',
        email: 'juancarlos@gmail.com',
        password: '123456',
      }
      const result: ResponseEmployeeDto = new ResponseEmployeeDto()
      jest.spyOn(service, 'create').mockRejectedValue(new BadRequestException())
      await expect(controller.create(employee)).rejects.toThrow(
        BadRequestException,
      )
    })
    it('should throw BadRequestException salary negative', async () => {
      const employee = {
        name: 'gv',
        salary: -1000,
        position: 'Test',
        email: 'juancarlos@gmail.com',
        password: '123456',
      }
      const result: ResponseEmployeeDto = new ResponseEmployeeDto()
      jest.spyOn(service, 'create').mockRejectedValue(new BadRequestException())
      await expect(controller.create(employee)).rejects.toThrow(
        BadRequestException,
      )
    })
    it('should throw BadRequestException position empty', async () => {
      const employee = {
        name: 'gv',
        salary: 1000,
        position: '',
        email: 'juancarlos@gmail.com',
        password: '123456',
      }
      const result: ResponseEmployeeDto = new ResponseEmployeeDto()
      jest.spyOn(service, 'create').mockRejectedValue(new BadRequestException())
      await expect(controller.create(employee)).rejects.toThrow(
        BadRequestException,
      )
    })
    it('should throw BadRequestException email empty', async () => {
      const employee = {
        name: 'gv',
        salary: 1000,
        position: 'Test',
        email: 'sdsd@gmail.com',
        password: '123456',
      }
      const result: ResponseEmployeeDto = new ResponseEmployeeDto()
      jest.spyOn(service, 'create').mockRejectedValue(new BadRequestException())
      await expect(controller.create(employee)).rejects.toThrow(
        BadRequestException,
      )
    })
  })
  describe('update', () => {
    it('should update an employee', async () => {
      const employee = {
        name: 'gv',
        salary: 1000,
        position: 'Test',
        email: 'sdsd@gmail.com',
        password: '123456',
      }
      const result: ResponseEmployeeDto = new ResponseEmployeeDto()
      jest.spyOn(service, 'update').mockResolvedValue(result)
      await controller.update(1, employee)
      expect(service.update).toHaveBeenCalled()
      expect(service.update).toHaveBeenCalledWith(1, employee)
    })
    it('should update an employees with BadRequestException name empty', async () => {
      const employee = {
        name: '',
        salary: 1000,
        position: 'Test',
        email: 'sdsd@gmail.com',
        password: '123456',
      }
      const result: ResponseEmployeeDto = new ResponseEmployeeDto()
      jest.spyOn(service, 'update').mockRejectedValue(new BadRequestException())
      await expect(controller.update(1, employee)).rejects.toThrow(
        BadRequestException,
      )
    })
    it('should update an employees with BadRequestException negative salary', async () => {
      const employee = {
        name: 'gv',
        salary: -1000,
        position: 'Test',
        email: 'sdsd@gmail.com',
        password: '123456',
      }
      const result: ResponseEmployeeDto = new ResponseEmployeeDto()
      jest.spyOn(service, 'update').mockRejectedValue(new BadRequestException())
      await expect(controller.update(1, employee)).rejects.toThrow(
        BadRequestException,
      )
    })
    it('should update an employees with BadRequestException bad email', async () => {
      const employee = {
        name: 'gv',
        salary: 1000,
        position: 'Test',
        email: 'as',
        password: '123456',
      }
      const result: ResponseEmployeeDto = new ResponseEmployeeDto()
      jest.spyOn(service, 'update').mockRejectedValue(new BadRequestException())
      await expect(controller.update(1, employee)).rejects.toThrow(
        BadRequestException,
      )
    })
  })
  describe('remove', () => {
    it('should remove an employee', async () => {
      const result: ResponseEmployeeDto = new ResponseEmployeeDto()
      jest.spyOn(service, 'remove').mockResolvedValue(undefined)
      await controller.remove(1)
      expect(service.remove).toHaveBeenCalled()
      expect(service.remove).toHaveBeenCalledWith(1)
    })
    it('should remove an employee with BadRequestException', async () => {
      const result: ResponseEmployeeDto = new ResponseEmployeeDto()
      jest.spyOn(service, 'remove').mockRejectedValue(new BadRequestException())
      await expect(controller.remove(1)).rejects.toThrow(BadRequestException)
    })
  })
})
