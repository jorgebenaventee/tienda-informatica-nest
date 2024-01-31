import { INestApplication, NotFoundException } from '@nestjs/common'
import { AppModule } from '../../../dist/app.module'
import { Test, TestingModule } from '@nestjs/testing'
import { Employee } from '../../../src/rest/employees/entities/employee.entity'
import { CreateEmployeeDto } from '../../../src/rest/employees/dto/create-employee.dto'
import { UpdateEmployeeDto } from '../../../src/rest/employees/dto/update-employee.dto'
import { EmployeesService } from '../../../src/rest/employees/services/employees.service'
import { EmployeesController } from '../../../src/rest/employees/controller/employees.controller'
import * as request from 'supertest'
import { CacheModule } from '@nestjs/cache-manager'
import { getRepositoryToken } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Client } from '../../../src/rest/clients/entities/client.entity'
import { JwtAuthGuard } from '../../../src/rest/auth/jwt-auth/jwt-auth.guard'
import { RolesGuard } from '../../../src/rest/auth/roles/roles.guard'

describe('EmployeesController (e2e)', () => {
  let app: INestApplication

  const myEndpoint = '/employees'

  const mockEmployeesService = {
    findAll: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    softRemove: jest.fn(),
    updateImage: jest.fn(),
  }

  const createEmployeeDto: CreateEmployeeDto = {
    name: 'John',
    email: 'juan@gmail.com',
    salary: 1000,
    position: 'Developer',
    password: '123456',
  }

  const updateEmployeeDto: UpdateEmployeeDto = {
    name: 'John',
  }

  const employeesToTest: Employee[] = [
    {
      id: 1,
      name: 'John',
      email: 'juan@gmail.com',
      salary: 1000,
      position: 'Developer',
      password: '123456',
      createdAt: new Date(),
      updatedAt: new Date(),
      isDeleted: false,
    },
    {
      id: 2,
      name: 'Juan',
      email: 'juan@gmail.com',
      salary: 1000,
      position: 'Developer',
      password: '123456',
      createdAt: new Date(),
      updatedAt: new Date(),
      isDeleted: false,
    },
  ]

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule, CacheModule.register()],
      controllers: [EmployeesController],
      providers: [
        {
          provide: EmployeesService,
          useValue: mockEmployeesService,
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

  describe('GET /employees', () => {
    it('should return all employees', async () => {
      mockEmployeesService.findAll.mockResolvedValue(employeesToTest)

      const { body } = await request(app.getHttpServer())
        .get(`${myEndpoint}`)
        .expect(200)
      expect(() => {
        expect(body).toEqual(employeesToTest)
        expect(mockEmployeesService.findAll).toHaveBeenCalled()
      })
    })
  })

  describe('GET /employees/:id', () => {
    it('should return employee by id', async () => {
      mockEmployeesService.findOne.mockResolvedValue(employeesToTest[0])

      const { body } = await request(app.getHttpServer())
        .get(`${myEndpoint}/${employeesToTest[0].id}`)
        .expect(200)
      expect(() => {
        expect(body).toEqual(employeesToTest[0])
        expect(mockEmployeesService.findOne).toHaveBeenCalled()
      })
    })

    it('shouled return 404 error', async () => {
      mockEmployeesService.findOne.mockRejectedValue(new NotFoundException())

      await request(app.getHttpServer())
        .get(`${myEndpoint}/${employeesToTest[0].id}`)
        .expect(404)
    })
  })

  describe('POST /employees', () => {
    test('shouled create a employee', async () => {
      mockEmployeesService.create.mockResolvedValue(employeesToTest[0])

      const { body } = await request(app.getHttpServer())
        .post(`${myEndpoint}`)
        .send(createEmployeeDto)
        .expect(201)
      expect(() => {
        expect(body).toEqual(employeesToTest[0])
        expect(mockEmployeesService.create).toHaveBeenCalled()
      })
    })
  })

  describe('PUT /employees/:id', () => {
    test('should update an employee', async () => {
      mockEmployeesService.update.mockResolvedValue(employeesToTest[1])

      const { body } = await request(app.getHttpServer())
        .put(`${myEndpoint}/${employeesToTest[1].id}`)
        .send(updateEmployeeDto)
        .expect(200)
      expect(() => {
        expect(body).toEqual(employeesToTest[1])
        expect(mockEmployeesService.update).toHaveBeenCalled()
      })
    })

    test('should return 404 error', async () => {
      mockEmployeesService.update.mockRejectedValue(new NotFoundException())

      await request(app.getHttpServer())
        .put(`${myEndpoint}/${employeesToTest[1].id}`)
        .send(updateEmployeeDto)
        .expect(404)
    })
  })

  describe('DELETE /employees/:id', () => {
    test('should remove an employee', async () => {
      mockEmployeesService.remove.mockResolvedValue(undefined)

      await request(app.getHttpServer())
        .delete(`${myEndpoint}/${employeesToTest[1].id}`)
        .expect(204)
      expect(() => {
        expect(mockEmployeesService.softRemove).toHaveBeenCalled()
      })
    })

    test('should return 404 error', async () => {
      mockEmployeesService.remove.mockRejectedValue(new NotFoundException())

      await request(app.getHttpServer())
        .delete(`${myEndpoint}/${employeesToTest[1].id}`)
        .expect(404)
    })
  })
})
