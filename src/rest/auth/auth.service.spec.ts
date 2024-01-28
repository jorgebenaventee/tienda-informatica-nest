import { AuthService } from './auth.service'
import { TestBed } from '@automock/jest'
import { ClientsService } from '../clients/clients.service'
import { EmployeesService } from '../employees/services/employees.service'
import { client, clientResponseDto, createClientDto } from '../clients/mocks'
import { UnauthorizedException } from '@nestjs/common'
import * as bcrypt from 'bcryptjs'
import { Employee } from '../employees/entities/employee.entity'
import { ClientMapper } from '../clients/client-mapper/client-mapper'
import { EmployeesMapper } from '../employees/mapper/employees.mapper'

describe('AuthService', () => {
  let service: AuthService
  let clientService: jest.Mocked<ClientsService>
  let employeeService: jest.Mocked<EmployeesService>
  let clientMapper: jest.Mocked<ClientMapper>
  let employeeMapper: jest.Mocked<EmployeesMapper>

  beforeEach(async () => {
    const { unit, unitRef } = await TestBed.create(AuthService).compile()
    service = unit
    clientService = unitRef.get(ClientsService)
    employeeService = unitRef.get(EmployeesService)
    clientMapper = unitRef.get(ClientMapper)
    employeeMapper = unitRef.get(EmployeesMapper)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  describe('signUp', () => {
    it('should return access token', async () => {
      clientService.create.mockResolvedValue(clientResponseDto)
      const result = await service.signUp(createClientDto)
      expect(result).toHaveProperty('accessToken')
    })
  })

  describe('signIn', () => {
    it('should return access token', async () => {
      clientService.findByEmail.mockResolvedValue(client)
      jest.spyOn(bcrypt, 'compare').mockImplementation(() => true)
      const result = await service.signIn({
        email: client.email,
        password: client.password,
      })
      expect(result).toHaveProperty('accessToken')
    })

    it('should throw UnauthorizedException when user not found', async () => {
      clientService.findByEmail.mockResolvedValue(null)
      employeeService.findByEmail.mockResolvedValue(null)
      await expect(() =>
        service.signIn({
          email: client.email,
          password: client.password,
        }),
      ).rejects.toThrow(UnauthorizedException)
    })

    it('should throw UnauthorizedException when password is invalid', async () => {
      clientService.findByEmail.mockResolvedValue(client)
      employeeService.findByEmail.mockResolvedValue(null)
      jest.spyOn(bcrypt, 'compare').mockImplementation(() => false)
      await expect(() =>
        service.signIn({
          email: client.email,
          password: 'invalid',
        }),
      ).rejects.toThrow(UnauthorizedException)
    })
  })

  describe('validateUser', () => {
    it('should return client', async () => {
      clientService.findByEmail.mockResolvedValue(client)
      const result = await service.validateUser(client.email)
      expect(result).toHaveProperty('role', 'client')
    })

    it('should return employee', async () => {
      clientService.findByEmail.mockResolvedValue(null)
      employeeService.findByEmail.mockResolvedValue({
        email: client.email,
      } as Employee)
      const result = await service.validateUser(client.email)
      expect(result).toHaveProperty('role', 'employee')
    })

    it('should return null', async () => {
      clientService.findByEmail.mockResolvedValue(null)
      employeeService.findByEmail.mockResolvedValue(null)
      const result = await service.validateUser(client.email)
      expect(result).toBeNull()
    })
  })
})
