import { Test, TestingModule } from '@nestjs/testing'
import { EmployeesMapper } from './employees.mapper'
import { Employee } from '../entities/employee.entity'
import { ResponseEmployeeDto } from '../dto/response-employee.dto'

describe('Mapper', () => {
  let provider: EmployeesMapper

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EmployeesMapper],
    }).compile()

    provider = module.get<EmployeesMapper>(EmployeesMapper)
  })

  it('should be defined', () => {
    expect(provider).toBeDefined()
  })

  describe('toDto', () => {
    it('should convert entity to DTO', () => {
      const employee: Employee = {
        id: 1,
        name: 'John',
        email: 'si@gmail.com',
        salary: 1000,
        position: 'Developer',
        password: '123456',
        createdAt: new Date(),
        updatedAt: new Date(),
        isDeleted: false,
      }

      const result = provider.toDto(employee)

      expect(result).toEqual({
        id: 1,
        name: 'John',
        email: 'si@gmail.com',
        salary: 1000,
        position: 'Developer',
        createdAt: employee.createdAt,
        updatedAt: employee.updatedAt,
        isDeleted: false,
      })
    })
  })

  describe('toEntity', () => {
    it('should convert DTO to entity', () => {
      const employee: Employee = {
        id: 1,
        name: 'John',
        email: 'si@gmail.com',
        salary: 1000,
        position: 'Developer',
        password: '123456',
        createdAt: new Date(),
        updatedAt: new Date(),
        isDeleted: false,
      }

      const createEmployeeDto: ResponseEmployeeDto = {
        id: 1,
        name: 'John',
        email: 'si@gmail.com',
        salary: 1000,
        position: 'Developer',
        password: '123456',
        createdAt: employee.createdAt,
        updatedAt: employee.updatedAt,
        isDeleted: false,
      }

      const result = provider.toEntity(createEmployeeDto)

      expect(result).toEqual(employee)
    })
  })
})
