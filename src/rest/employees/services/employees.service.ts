import { Inject, Injectable, Logger, NotFoundException } from '@nestjs/common'
import { CreateEmployeeDto } from '../dto/create-employee.dto'
import { UpdateEmployeeDto } from '../dto/update-employee.dto'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { CategoryService } from '../../category/services/category.service'
import { CACHE_MANAGER } from '@nestjs/cache-manager'
import { Cache } from 'cache-manager'
import { SuppliersService } from '../../suppliers/services/suppliers.service'
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
import { ResponseProductDto } from '../../products/dto/response-product.dto'
import { hash } from 'typeorm/util/StringUtils'
import {
  Notification,
  NotificationType,
} from '../../../websockets/notifications/models/notification.model'
import { ResponseSupplierDto } from '../../suppliers/dto/response-supplier.dto'

@Injectable()
export class EmployeesService {
  private logger = new Logger('EmployeeService')

  constructor(
    @InjectRepository(Employee)
    private readonly employeeRepository: Repository<Employee>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private readonly employeeMapper: EmployeesMapper,
    private readonly notificationGateway: NotificationGateway,
  ) {}

  async create(createEmployeeDto: CreateEmployeeDto) {
    this.logger.log('Creating employee')
    const employee = this.employeeMapper.toEntity(createEmployeeDto)
    const resDto = this.employeeMapper.toDto(
      await this.employeeRepository.save(employee),
    )
    await this.invalidateCache(`all_employees_page_`)
    await this.sendNotification(NotificationType.CREATE, resDto)
    return resDto
  }

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
      sortableColumns: ['name', 'salary', 'position', 'email'],
      defaultSortBy: [['id', 'ASC']],
      searchableColumns: ['name', 'salary', 'position', 'email'],
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
    }

    await this.cacheManager.set(
      `all_employees_page_${hash(JSON.stringify(query))}`,
      toResponse,
      60,
    )

    return toResponse
  }

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

  async update(id: number, updateEmployeeDto: UpdateEmployeeDto) {
    this.logger.log(`Updating employee with id: ${id}`)
    const existingEmployee = await this.findOne(id)

    const updatedEmployee = await this.employeeRepository.save({
      ...existingEmployee,
      ...updateEmployeeDto,
    })

    const updatedEmployeeDto = this.employeeMapper.toDto(updatedEmployee)
    await this.sendNotification(NotificationType.UPDATE, updatedEmployeeDto)
    await this.invalidateCache(`all_employees_page_`)
    await this.invalidateCache(`employee_${id}`)

    return updatedEmployeeDto
  }

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

  async invalidateCache(keyPattern: string): Promise<void> {
    const cacheKeys = await this.cacheManager.store.keys()
    const keysToDelete = cacheKeys.filter((key) => key.startsWith(keyPattern))
    const promises = keysToDelete.map((key) => this.cacheManager.del(key))
    await Promise.all(promises)
  }

  async sendNotification(type: NotificationType, data: ResponseEmployeeDto) {
    const notification = new Notification<ResponseEmployeeDto>(
      'employee',
      type,
      data,
      new Date(),
    )
    this.notificationGateway.sendMessage(notification)
  }
}
