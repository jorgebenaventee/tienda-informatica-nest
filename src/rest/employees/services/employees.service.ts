import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common'
import { CreateEmployeeDto } from '../dto/create-employee.dto'
import { UpdateEmployeeDto } from '../dto/update-employee.dto'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { CACHE_MANAGER } from '@nestjs/cache-manager'
import { Cache } from 'cache-manager'
import { NotificationGateway } from '../../../websockets/notifications/notifications.gateway'
import { Employee } from '../entities/employee.entity'
import { EmployeesMapper } from '../mapper/employees.mapper'
import { ResponseEmployeeDto } from '../dto/response-employee.dto'
import {
  FilterOperator,
  FilterSuffix,
  paginate,
  PaginateQuery,
} from 'nestjs-paginate'
import { hash } from 'typeorm/util/StringUtils'
import { hash as hashPassword } from 'bcryptjs'
import {
  Notification,
  NotificationType,
} from '../../../websockets/notifications/models/notification.model'
import { Client } from '../../clients/entities/client.entity'
import { HASH_ROUNDS } from '../../utils/constants'

@Injectable()
export class EmployeesService {
  private logger = new Logger('EmployeeService')

  constructor(
    @InjectRepository(Employee)
    private readonly employeeRepository: Repository<Employee>,
    @InjectRepository(Client)
    private readonly clientRepository: Repository<Client>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private readonly employeeMapper: EmployeesMapper,
    private readonly notificationGateway: NotificationGateway,
  ) {}

  /**
   * Creates a new employee
   * @param createEmployeeDto
   */
  async create(createEmployeeDto: CreateEmployeeDto) {
    const exists = await this.employeeRepository.exist({
      where: { email: createEmployeeDto.email },
    })
    if (exists) {
      throw new BadRequestException('Email already exists')
    }
    this.logger.log('Creating employee')
    const employee = this.employeeMapper.toEntity(createEmployeeDto)
    employee.password = await hashPassword(employee.password, HASH_ROUNDS)
    const resDto = this.employeeMapper.toDto(
      await this.employeeRepository.save(employee),
    )
    await this.invalidateCache(`all_employees_page_`)
    await this.sendNotification(NotificationType.CREATE, resDto)
    return resDto
  }

  /**
   * Finds all employees
   * @param query
   */
  async findAll(query: PaginateQuery) {
    this.logger.log('Finding all employees')
    const cache: ResponseEmployeeDto[] = await this.cacheManager.get(
      `all_employees_page_${hash(JSON.stringify(query))}`,
    )
    if (cache) {
      this.logger.log('Employees found in cache')
      return cache
    }

    const page = await paginate(query, this.employeeRepository, {
      where: {
        isDeleted: false,
      },
      sortableColumns: ['name', 'salary', 'position', 'email', 'isDeleted'],
      defaultSortBy: [['id', 'ASC']],
      searchableColumns: ['name', 'salary', 'position', 'email', 'isDeleted'],
      filterableColumns: {
        name: [FilterOperator.EQ, FilterSuffix.NOT],
        salary: [FilterOperator.EQ, FilterSuffix.NOT],
        position: [FilterOperator.EQ, FilterSuffix.NOT],
        email: [FilterOperator.EQ, FilterSuffix.NOT],
        isDeleted: [FilterOperator.EQ, FilterSuffix.NOT],
      },
    })

    const toResponse = {
      data: (page.data ?? []).map((employee) =>
        this.employeeMapper.toDto(employee),
      ),
      meta: page.meta,
      links: page.links,
    }

    await this.cacheManager.set(
      `all_employees_page_${hash(JSON.stringify(query))}`,
      toResponse,
      60,
    )

    return toResponse
  }

  /**
   * Finds one employee by id
   * @param id
   */
  async findOne(id: number) {
    this.logger.log(`Finding employee with id: ${id}`)
    const cache: ResponseEmployeeDto = await this.cacheManager.get(
      `employee_${id}`,
    )
    if (cache) {
      this.logger.log(`Employee with id: ${id} found in cache`)
      return cache
    }

    const toResponse = this.employeeMapper.toDto(
      (await this.employeeRepository.findOneBy({
        id,
        isDeleted: false,
      })) ||
        (() => {
          throw new NotFoundException(`Employee with id: ${id} not found`)
        })(),
    )
    await this.cacheManager.set(`employee_${id}`, toResponse, 60)
    return toResponse
  }

  /**
   * Updates an employee
   * @param id
   * @param updateEmployeeDto
   */
  async update(id: number, updateEmployeeDto: UpdateEmployeeDto) {
    const exists = await this.employeeRepository.exist({
      where: { email: updateEmployeeDto.email },
    })
    if (exists) {
      throw new BadRequestException('Email already exists')
    }
    this.logger.log(`Updating employee with id: ${id}`)
    const currentEmployeeDto = await this.findOne(id)

    const employeeToSave = {
      ...currentEmployeeDto,
      ...updateEmployeeDto,
    }
    if (updateEmployeeDto.password) {
      employeeToSave.password = await hashPassword(
        updateEmployeeDto.password,
        HASH_ROUNDS,
      )
    }
    const savedEmployee = await this.employeeRepository.save(employeeToSave)
    const resDto = this.employeeMapper.toDto(savedEmployee)
    await this.sendNotification(NotificationType.UPDATE, resDto)
    await this.invalidateCache(`all_employees_page_`)
    await this.invalidateCache(`employee_${id}`)
    return resDto

    const updatedEmployeeDto = this.employeeMapper.toDto(savedEmployee)
    await this.sendNotification(NotificationType.UPDATE, updatedEmployeeDto)
    await this.invalidateCache(`all_employees_page_`)
    await this.invalidateCache(`employee_${id}`)

    return updatedEmployeeDto
  }

  /**
   *  Removes an employee
   * @param id
   */
  async remove(id: number) {
    this.logger.log(`Deleting employee with id: ${id}`)
    const employeeToRemove = await this.findOne(id)
    await this.employeeRepository.save({
      ...employeeToRemove,
      isDeleted: true,
    })
    await this.invalidateCache(`all_employees_page_`)
    await this.invalidateCache(`employee_${id}`)
    await this.sendNotification(NotificationType.DELETE, employeeToRemove)
  }

  /**
   * Invalidates cache by key pattern
   * @param keyPattern
   */
  async invalidateCache(keyPattern: string): Promise<void> {
    const cacheKeys = await this.cacheManager.store.keys()
    const keysToDelete = cacheKeys.filter((key) => key.startsWith(keyPattern))
    const promises = keysToDelete.map((key) => this.cacheManager.del(key))
    await Promise.all(promises)
  }

  /**
   * Sends a notification
   * @param type
   * @param data
   */
  async sendNotification(type: NotificationType, data: ResponseEmployeeDto) {
    const notification = new Notification<ResponseEmployeeDto>(
      'employee',
      type,
      data,
      new Date(),
    )
    this.notificationGateway.sendMessage(notification)
  }

  async findByEmail(email: string) {
    const employee = await this.employeeRepository.findOne({ where: { email } })
    if (!employee) {
      return null
    }
    return employee
  }
}
