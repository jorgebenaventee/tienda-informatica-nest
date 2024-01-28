import { ClientsService } from './clients.service'
import { TestBed } from '@automock/jest'
import { Repository } from 'typeorm'
import { Client } from './entities/client.entity'
import { CACHE_MANAGER } from '@nestjs/cache-manager'
import { Employee } from '../employees/entities/employee.entity'
import { client, clientResponseDto, createClientDto } from './mocks'
import { ClientMapper } from './client-mapper/client-mapper'
import { Cache } from 'cache-manager'

describe('ClientsService', () => {
  let service: ClientsService
  let clientRepository: jest.Mocked<Repository<Client>>
  let employeeRepository: jest.Mocked<Repository<Employee>>
  let cacheManager: jest.Mocked<Cache>
  let clientMapper: jest.Mocked<ClientMapper>

  beforeEach(async () => {
    const { unit, unitRef } = TestBed.create(ClientsService).compile()
    service = unit
    clientRepository = unitRef.get<Repository<Client>>('ClientRepository')
    employeeRepository = unitRef.get<Repository<Employee>>('EmployeeRepository')
    cacheManager = unitRef.get<Cache>(CACHE_MANAGER)
    clientMapper = unitRef.get<ClientMapper>(ClientMapper)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  describe('create', () => {
    it('should create a client', async () => {
      employeeRepository.exist.mockResolvedValue(false)
      clientRepository.exist.mockResolvedValue(false)
      clientRepository.save.mockResolvedValue(client)
      clientMapper.fromEntity.mockReturnValue(clientResponseDto)
      const response = await service.create(createClientDto)
      expect(response).toEqual(clientResponseDto)
    })
    it('should throw an error if email already exists in employees', async () => {
      employeeRepository.exist.mockResolvedValue(true)
      clientRepository.exist.mockResolvedValue(false)
      clientRepository.save.mockResolvedValue(client)
      clientMapper.fromEntity.mockReturnValue(clientResponseDto)
      await expect(service.create(createClientDto)).rejects.toThrow(
        'Email already exists',
      )
    })
    it('should throw an error if email already exists in clients', async () => {
      employeeRepository.exist.mockResolvedValue(false)
      clientRepository.exist.mockResolvedValue(true)
      clientRepository.save.mockResolvedValue(client)
      clientMapper.fromEntity.mockReturnValue(clientResponseDto)
      await expect(service.create(createClientDto)).rejects.toThrow(
        'Email already exists',
      )
    })
  })
  describe('findAll', () => {
    const paginateOptions = {
      page: 1,
      limit: 10,
      path: 'clients',
    }
    it('should return paginated clients', async () => {
      const anyClientRepository = clientRepository as any
      cacheManager.get.mockResolvedValue(null)
      cacheManager.set.mockResolvedValue(null)
      clientRepository.find.mockResolvedValue([client])
      clientMapper.fromEntity.mockReturnValue(clientResponseDto)
      anyClientRepository.leftJoinAndSelect.mockReturnThis()
      anyClientRepository.take.mockReturnThis()
      anyClientRepository.skip.mockReturnThis()
      anyClientRepository.addOrderBy.mockReturnThis()
      anyClientRepository.getManyAndCount.mockResolvedValue([[client], 1])
      const response = await service.findAll(paginateOptions)
      expect(response.data).toEqual([clientResponseDto])
    })
  })
  describe('findOne', () => {
    it('should return client if exists', () => {
      cacheManager.get.mockResolvedValue(null)
      cacheManager.set.mockResolvedValue(null)
      clientRepository.findOne.mockResolvedValue(client)
      clientMapper.fromEntity.mockReturnValue(clientResponseDto)
      expect(service.findOne(1)).resolves.toEqual(clientResponseDto)
    })

    it('should throw an error if client does not exist', () => {
      cacheManager.get.mockResolvedValue(null)
      cacheManager.set.mockResolvedValue(null)
      clientRepository.findOne.mockResolvedValue(undefined)
      clientMapper.fromEntity.mockReturnValue(clientResponseDto)
      expect(service.findOne(1)).rejects.toThrow('Client with id 1 not found')
    })
  })
  describe('update', () => {
    it('should update client if exists', () => {
      employeeRepository.exist.mockResolvedValue(false)
      clientRepository.exist.mockResolvedValue(false)
      cacheManager.get.mockResolvedValue(null)
      cacheManager.set.mockResolvedValue(null)
      cacheManager.del.mockResolvedValue(null)
      cacheManager.store = {
        keys: jest.fn().mockResolvedValue([]),
      } as unknown as typeof cacheManager.store
      clientRepository.findOne.mockResolvedValue(client)
      clientRepository.save.mockResolvedValue(client)
      clientMapper.fromEntity.mockReturnValue(clientResponseDto)
      expect(service.update(1, createClientDto)).resolves.toEqual(
        clientResponseDto,
      )
    })

    it('should throw an error if client does not exist', () => {
      employeeRepository.exist.mockResolvedValue(false)
      clientRepository.exist.mockResolvedValue(false)
      cacheManager.get.mockResolvedValue(null)
      cacheManager.set.mockResolvedValue(null)
      clientRepository.findOne.mockResolvedValue(undefined)
      clientMapper.fromEntity.mockReturnValue(clientResponseDto)
      expect(service.update(1, createClientDto)).rejects.toThrow(
        'Client with id 1 not found',
      )
    })
    it('should throw an error if email already exists in employees', async () => {
      employeeRepository.exist.mockResolvedValue(true)
      clientRepository.exist.mockResolvedValue(false)
      clientRepository.save.mockResolvedValue(client)
      clientMapper.fromEntity.mockReturnValue(clientResponseDto)
      await expect(service.update(1, createClientDto)).rejects.toThrow(
        'Email already exists',
      )
    })
    it('should throw an error if email already exists in clients', async () => {
      employeeRepository.exist.mockResolvedValue(false)
      clientRepository.exist.mockResolvedValue(true)
      clientRepository.save.mockResolvedValue(client)
      clientMapper.fromEntity.mockReturnValue(clientResponseDto)
      await expect(service.update(1, createClientDto)).rejects.toThrow(
        'Email already exists',
      )
    })
  })
  describe('remove', () => {
    it('should remove client if exists', () => {
      cacheManager.get.mockResolvedValue(null)
      cacheManager.set.mockResolvedValue(null)
      clientRepository.findOne.mockResolvedValue(client)
      clientRepository.remove.mockResolvedValue(undefined)
      cacheManager.del.mockResolvedValue(null)
      cacheManager.store = {
        keys: jest.fn().mockResolvedValue([]),
      } as unknown as typeof cacheManager.store
      expect(service.remove(1)).resolves.toBeUndefined()
    })

    it('should throw an error if client does not exist', () => {
      cacheManager.get.mockResolvedValue(null)
      cacheManager.set.mockResolvedValue(null)
      clientRepository.findOne.mockResolvedValue(undefined)
      clientMapper.fromEntity.mockReturnValue(clientResponseDto)
      expect(service.remove(1)).rejects.toThrow('Client with id 1 not found')
    })
  })
})
