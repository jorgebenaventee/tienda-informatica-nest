import { INestApplication, NotFoundException } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import { ClientsService } from '../../../src/rest/clients/clients.service'
import { ClientsController } from '../../../src/rest/clients/clients.controller'
import { JwtAuthGuard } from '../../../src/rest/auth/jwt-auth/jwt-auth.guard'
import { RolesGuard } from '../../../src/rest/auth/roles/roles.guard'
import { createMock } from '@golevelup/ts-jest'
import {
  clientResponseDto,
  createClientDto,
} from '../../../src/rest/clients/mocks'
import * as request from 'supertest'
import { Paginated } from 'nestjs-paginate'
import { ClientResponseDto } from '../../../src/rest/clients/dto/client-response.dto'

describe('ClientsController (e2e)', () => {
  let app: INestApplication
  const myEndpoint = '/clients'

  const mockClientService = createMock<ClientsService>()
  beforeEach(async () => {
    const moduleFixture = await Test.createTestingModule({
      controllers: [ClientsController],
      providers: [
        {
          provide: ClientsService,
          useValue: mockClientService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: () => true })
      .compile()

    app = moduleFixture.createNestApplication()
    await app.init()
  })

  afterAll(async () => {
    await app.close()
  })

  describe('GET/clients', () => {
    it('should return a paginated array of clients', async () => {
      const page = 1
      const size = 1
      mockClientService.findAll.mockResolvedValueOnce({
        data: [clientResponseDto],
        links: {
          current: 'http://localhost:3000/clients?page=1&size=1',
        },
      } as unknown as Paginated<ClientResponseDto>)
      const { body } = await request(app.getHttpServer())
        .get(`${myEndpoint}`)
        .query({ page, size })
        .expect(200)
      expect(body.data).toHaveLength(size)
      expect(body.data[0]).toMatchObject(clientResponseDto)
    })
  })

  describe('GET/clients/:id', () => {
    it('should return a client', async () => {
      mockClientService.findOne.mockResolvedValueOnce(clientResponseDto)
      const { body } = await request(app.getHttpServer())
        .get(`${myEndpoint}/${clientResponseDto.id}`)
        .expect(200)
      expect(body).toMatchObject(clientResponseDto)
    })
    it('should return a NotFoundException', async () => {
      mockClientService.findOne.mockRejectedValue(new NotFoundException())
      await request(app.getHttpServer()).get(`${myEndpoint}/1`).expect(404)
    })
  })

  describe('POST/clients', () => {
    it('should create a client', async () => {
      mockClientService.create.mockResolvedValueOnce(clientResponseDto)
      const { body } = await request(app.getHttpServer())
        .post(myEndpoint)
        .send(createClientDto)
        .expect(201)
      expect(body).toMatchObject(clientResponseDto)
    })

    it('should return a BadRequestException if body is empty', async () => {
      mockClientService.create.mockRejectedValue(new NotFoundException())
      await request(app.getHttpServer()).post(myEndpoint).send({}).expect(400)
    })
  })

  describe('PUT/clients/:id', () => {
    it('should update a client', async () => {
      mockClientService.update.mockResolvedValueOnce(clientResponseDto)
      const { body } = await request(app.getHttpServer())
        .patch(`${myEndpoint}/${clientResponseDto.id}`)
        .send(createClientDto)
        .expect(200)
      expect(body).toMatchObject(clientResponseDto)
    })
    it('should return a NotFoundException', async () => {
      mockClientService.update.mockRejectedValue(new NotFoundException())
      await request(app.getHttpServer())
        .put(`${myEndpoint}/1`)
        .send(createClientDto)
        .expect(404)
    })
  })

  describe('DELETE/clients/:id', () => {
    it('should delete a client', async () => {
      mockClientService.remove.mockResolvedValueOnce(undefined)
      await request(app.getHttpServer())
        .delete(`${myEndpoint}/${clientResponseDto.id}`)
        .expect(204)
    })
    it('should return a NotFoundException', async () => {
      mockClientService.remove.mockRejectedValue(new NotFoundException())
      await request(app.getHttpServer()).delete(`${myEndpoint}/1`).expect(404)
    })
  })
})
