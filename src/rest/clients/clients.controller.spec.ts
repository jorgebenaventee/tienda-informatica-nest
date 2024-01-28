import { ClientsController } from './clients.controller'
import { TestBed } from '@automock/jest'
import { ClientsService } from './clients.service'
import { clientResponseDto, createClientDto, updateClientDto } from './mocks'
import { CreateClientDto } from './dto/create-client.dto'
import { BadRequestException } from '@nestjs/common'
import { ClientResponseDto } from './dto/client-response.dto'
import { Paginated } from 'nestjs-paginate'
import { UpdateClientDto } from './dto/update-client.dto'

describe('ClientsController', () => {
  let controller: ClientsController
  let service: jest.Mocked<ClientsService>

  beforeEach(async () => {
    const { unit, unitRef } = await TestBed.create(ClientsController).compile()
    controller = unit
    service = unitRef.get(ClientsService)
  })

  it('should be defined', () => {
    expect(controller).toBeDefined()
  })

  describe('create', () => {
    it('should return a client', () => {
      service.create.mockResolvedValueOnce(clientResponseDto)
      expect(controller.create(createClientDto)).resolves.toEqual(
        clientResponseDto,
      )
    })
    it('should throw an error if email already exists', () => {
      service.create.mockRejectedValueOnce(new Error())
      expect(controller.create(createClientDto)).rejects.toThrow()
    })
    it('should throw an error if createClientDto is empty', () => {
      expect(() => controller.create({} as CreateClientDto)).toThrow(
        BadRequestException,
      )
    })
  })

  describe('findAll', () => {
    it('should return a page of clients', () => {
      const paginateOptions = {
        page: 1,
        limit: 10,
        path: 'clients',
      }
      const page: Paginated<ClientResponseDto> = {
        data: [clientResponseDto],
        meta: {
          itemsPerPage: 10,
          totalItems: 1,
          totalPages: 1,
          currentPage: 1,
        },
        links: {
          current: 'http://localhost:3000/api/clients?page=1&limit=10',
        },
      } as Paginated<ClientResponseDto>
      service.findAll.mockResolvedValueOnce(page)
      expect(controller.findAll(paginateOptions)).resolves.toEqual(page)
    })
  })

  describe('findOne', () => {
    it('should return a client', () => {
      service.findOne.mockResolvedValueOnce(clientResponseDto)
      expect(controller.findOne('1')).resolves.toEqual(clientResponseDto)
    })
    it('should throw an error if client does not exist', () => {
      service.findOne.mockRejectedValueOnce(new Error())
      expect(controller.findOne('1')).rejects.toThrow()
    })
  })

  describe('update', () => {
    it('should return a client', () => {
      service.update.mockResolvedValueOnce(clientResponseDto)
      expect(controller.update('1', updateClientDto)).resolves.toEqual(
        clientResponseDto,
      )
    })
    it('should throw an error if client does not exist', () => {
      service.update.mockRejectedValueOnce(new Error())
      expect(controller.update('1', updateClientDto)).rejects.toThrow()
    })
    it('should throw an error if updateClientDto is empty', () => {
      expect(() =>
        controller.update('1', {} as UpdateClientDto),
      ).rejects.toThrow(BadRequestException)
    })
    it('should throw an error if email exists', () => {
      service.update.mockRejectedValueOnce(new Error())
      expect(controller.update('1', updateClientDto)).rejects.toThrow()
    })
  })

  describe('remove', () => {
    it('should return a client', () => {
      service.remove.mockResolvedValueOnce(undefined)
      expect(controller.remove('1')).resolves.toBeUndefined()
    })
    it('should throw an error if client does not exist', () => {
      service.remove.mockRejectedValueOnce(new Error())
      expect(controller.remove('1')).rejects.toThrow()
    })
  })
})
