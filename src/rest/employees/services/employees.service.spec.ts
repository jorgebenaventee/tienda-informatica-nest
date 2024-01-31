import { Test, TestingModule } from '@nestjs/testing'
import { EmployeesService } from './employees.service'
import { Repository } from 'typeorm'
import { Employee } from '../entities/employee.entity'
import { EmployeesMapper } from '../mapper/employees.mapper'
import { NotificationGateway } from '../../../websockets/notifications/notifications.gateway'
import { CACHE_MANAGER } from '@nestjs/cache-manager'
import { getRepositoryToken } from '@nestjs/typeorm'
import { CreateEmployeeDto } from '../dto/create-employee.dto'
import { ResponseEmployeeDto } from '../dto/response-employee.dto'
import { Cache } from 'cache-manager'
import { Paginated } from 'nestjs-paginate'
import { NotFoundException } from '@nestjs/common'
import { UpdateEmployeeDto } from '../dto/update-employee.dto'
import { Client } from '../../clients/entities/client.entity'

describe('EmployeesService', () => {
  let service: EmployeesService
  let employeeReposiroty: Repository<Employee>
  let mapper: EmployeesMapper
  let cacheManager: Cache
  let notificationGateway: NotificationGateway
  let clientRepository: Repository<Client>

  const mockMapper = {
    toEntity: jest.fn(),
    toDto: jest.fn(),
  }

  const mockCacheManager = {
    get: jest.fn(() => Promise.resolve()),
    set: jest.fn(() => Promise.resolve()),
    store: {
      keys: jest.fn(),
    },
  }

  const mockNotificationGateway = {
    sendMessage: jest.fn(),
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmployeesService,
        { provide: EmployeesMapper, useValue: mockMapper },
        { provide: getRepositoryToken(Employee), useClass: Repository },
        {
          provide: getRepositoryToken(Client),
          useClass: Repository,
        },
        { provide: CACHE_MANAGER, useValue: mockCacheManager },
        { provide: NotificationGateway, useValue: mockNotificationGateway },
      ],
    }).compile()

    employeeReposiroty = module.get<Repository<Employee>>(
      getRepositoryToken(Employee),
    )
    clientRepository = module.get<Repository<Client>>(
      getRepositoryToken(Client),
    )
    mapper = module.get<EmployeesMapper>(EmployeesMapper)
    cacheManager = module.get<Cache>(CACHE_MANAGER)
    notificationGateway = module.get<NotificationGateway>(NotificationGateway)
    service = module.get<EmployeesService>(EmployeesService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  describe('create', () => {
    it('should create an employee', async () => {
      const employee: CreateEmployeeDto = {
        name: 'gv',
        salary: 1000,
        position: 'Test',
        email: 'sdsd@gmail.com',
        password: '123456',
      }

      const mockEmployee = new Employee()
      mockEmployee.password = '123456'
      const employeeResponseDto = new ResponseEmployeeDto()

      jest.spyOn(mapper, 'toEntity').mockReturnValue(mockEmployee)
      jest.spyOn(employeeReposiroty, 'exist').mockResolvedValue(false)
      jest.spyOn(clientRepository, 'exist').mockResolvedValue(false)
      jest.spyOn(employeeReposiroty, 'save').mockResolvedValue(mockEmployee)
      jest.spyOn(mapper, 'toDto').mockReturnValue(employeeResponseDto)
      jest.spyOn(cacheManager.store, 'keys').mockResolvedValue([])
      jest.spyOn(notificationGateway, 'sendMessage').mockImplementation()

      const result = await service.create(employee)
      expect(result).toEqual(employeeResponseDto)
      expect(notificationGateway.sendMessage).toHaveBeenCalled()
    })
    it('should create a employee with empty name', async () => {
      const employee: CreateEmployeeDto = {
        name: '',
        salary: 1000,
        position: 'Test',
        email: 'sdsd@gmail.com',
        password: '123456',
      }

      const result = service.create(employee)
      await expect(result).rejects.toThrow(TypeError)
    })

    it('should create a employee with negative salary', async () => {
      const employee: CreateEmployeeDto = {
        name: 'sdass',
        salary: -1000,
        position: 'Test',
        email: 'sdsd@gmail.com',
        password: '123456',
      }

      const result = service.create(employee)
      await expect(result).rejects.toThrow(TypeError)
    })

    it('should create a employee with empty position', async () => {
      const employee: CreateEmployeeDto = {
        name: 'sdass',
        salary: 1000,
        position: '',
        email: 'sdsd@gmail.com',
        password: '123456',
      }

      const result = service.create(employee)
      await expect(result).rejects.toThrow(TypeError)
    })

    it('should create a employee with bad email', async () => {
      const employee: CreateEmployeeDto = {
        name: 'sdass',
        salary: 1000,
        position: 'sdsd',
        email: 'sdsdl',
        password: '123456',
      }

      const result = service.create(employee)
      await expect(result).rejects.toThrow(TypeError)
    })

    it('should create a employee with empty password', async () => {
      const employee: CreateEmployeeDto = {
        name: 'sdass',
        salary: 1000,
        position: 'sdsd',
        email: 'sdsdl',
        password: '',
      }

      const result = service.create(employee)
      await expect(result).rejects.toThrow(TypeError)
    })
  })

  describe('findAll', () => {
    it('should return a page of employees', async () => {
      const paginatedOptions = {
        page: 1,
        limit: 10,
        path: 'employees',
      }
      const testEmployee = {
        data: [],
        meta: {
          itemsPerPage: 10,
          totalItems: 1,
          totalPages: 1,
          currentPage: 1,
        },
        links: {
          current:
            'http://localhost:3000/employees?page=1&limit=10&sort=name:ASC',
        },
      } as Paginated<ResponseEmployeeDto>

      jest
        .spyOn(cacheManager.store, 'keys')
        .mockResolvedValue(['suppliers:1:10:ASC'])
      jest.spyOn(cacheManager, 'get').mockResolvedValue(testEmployee)

      const result: any = await service.findAll(paginatedOptions)

      expect(cacheManager.get).toHaveBeenCalled()
      expect(result.links.current).toEqual(
        `http://localhost:3000/employees?page=${paginatedOptions.page}&limit=${paginatedOptions.limit}&sort=name:ASC`,
      )
    })
  })

  describe('findOne', () => {
    it('should return an employee', async () => {
      jest.spyOn(cacheManager, 'get').mockResolvedValue(Promise.resolve(null))
      const responseEmployeeDto: ResponseEmployeeDto = {
        id: 1,
        name: 'gv',
        salary: -1000,
        position: 'Test',
        email: 'sdsd@gmail.com',
        password: '123456',
        createdAt: new Date(),
        updatedAt: new Date(),
        isDeleted: false,
      }
      const employee = new Employee()

      jest.spyOn(employeeReposiroty, 'findOneBy').mockResolvedValue(employee)
      jest.spyOn(mapper, 'toDto').mockReturnValue(responseEmployeeDto)
      jest.spyOn(cacheManager, 'set').mockResolvedValue(null)

      const result = await service.findOne(1)
      expect(result).toEqual(responseEmployeeDto)
      expect(cacheManager.set).toHaveBeenCalled()
    })
    it('should throw an error if employee is not found', async () => {
      jest.spyOn(cacheManager, 'get').mockResolvedValue(Promise.resolve(null))
      const responseEmployeeDto: ResponseEmployeeDto = {
        id: 1,
        name: 'gv',
        salary: -1000,
        position: 'Test',
        email: 'sdsd@gmail.com',
        password: '123456',
        createdAt: new Date(),
        updatedAt: new Date(),
        isDeleted: false,
      }

      jest.spyOn(employeeReposiroty, 'findOneBy').mockResolvedValue(null)
      jest.spyOn(mapper, 'toDto').mockReturnValue(responseEmployeeDto)
      jest.spyOn(cacheManager, 'set').mockResolvedValue(null)

      const result = service.findOne(1)

      await expect(result).rejects.toThrow(NotFoundException)
    })
    it('should return a employees from cache', async () => {
      const responseEmployeeDto: ResponseEmployeeDto = {
        id: 1,
        name: 'gv',
        salary: -1000,
        position: 'Test',
        email: 'sdsd@gmail.com',
        password: '123456',
        createdAt: new Date(),
        updatedAt: new Date(),
        isDeleted: false,
      }
      jest
        .spyOn(cacheManager, 'get')
        .mockResolvedValue(Promise.resolve(responseEmployeeDto))
      jest.spyOn(mapper, 'toDto').mockReturnValue(responseEmployeeDto)

      const result = await service.findOne(1)
      expect(result).toEqual(responseEmployeeDto)
    })
  })

  describe('update', () => {
    it('should update an employee', async () => {
      const updateEmployeeDto: UpdateEmployeeDto = {
        name: 'sdass',
        salary: 1000,
        position: 'sdsd',
        email: 'sdsdl',
        password: '123456',
      }

      const employee = new Employee()

      jest.spyOn(employeeReposiroty, 'findOneBy').mockResolvedValue(employee)
      jest.spyOn(employeeReposiroty, 'save').mockResolvedValue(employee)
      jest.spyOn(employeeReposiroty, 'exist').mockResolvedValue(false)
      jest.spyOn(clientRepository, 'exist').mockResolvedValue(false)
      jest.spyOn(mapper, 'toDto').mockReturnValue(employee)
      jest.spyOn(cacheManager, 'set').mockResolvedValue(null)
      jest.spyOn(notificationGateway, 'sendMessage').mockImplementation()
      jest.spyOn(cacheManager.store, 'keys').mockResolvedValue([])

      expect(await service.update(1, updateEmployeeDto)).toEqual(employee)
    })

    it('should update an employee NotFoundException', async () => {
      const updateEmployeeDto: UpdateEmployeeDto = {
        name: 'sdass',
        salary: 1000,
        position: 'sdsd',
        email: 'sdsdl',
        password: '123456',
      }

      const employee = new Employee()

      jest.spyOn(employeeReposiroty, 'findOneBy').mockResolvedValue(null)

      await expect(service.update(1, updateEmployeeDto)).rejects.toThrow(
        TypeError,
      )
    })
  })

  describe('delete', () => {
    it('should remove a employee', async () => {
      const responseEmployeeDto = new ResponseEmployeeDto()
      const employee = new Employee()

      jest.spyOn(employeeReposiroty, 'findOneBy').mockResolvedValue(employee)
      jest
        .spyOn(employeeReposiroty, 'save')
        .mockResolvedValue(responseEmployeeDto)
      jest.spyOn(mapper, 'toDto').mockReturnValue(responseEmployeeDto)
      jest.spyOn(notificationGateway, 'sendMessage').mockImplementation()
      jest.spyOn(cacheManager.store, 'keys').mockResolvedValue([])

      await expect(service.remove(1)).resolves.toEqual(undefined)
      expect(notificationGateway.sendMessage).toHaveBeenCalled()
    })
    it('should remove a employee NotFoundException', async () => {
      const employee = new Employee()

      jest.spyOn(employeeReposiroty, 'findOneBy').mockResolvedValue(null)

      await expect(service.remove(1)).rejects.toThrow(TypeError)
    })
  })
})
