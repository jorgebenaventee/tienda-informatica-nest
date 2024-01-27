import { Inject, Injectable } from '@nestjs/common'
import { CreateEmployeeDto } from '../dto/create-employee.dto'
import { UpdateEmployeeDto } from '../dto/update-employee.dto'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { CategoryService } from '../../category/services/category.service'
import { CACHE_MANAGER } from '@nestjs/cache-manager'
import { Cache } from 'cache-manager'
import { SuppliersService } from '../../suppliers/services/suppliers.service'
import { NotificationGateway } from '../../../websockets/notifications/notifications.gateway'
import { Employee } from "../entities/employee.entity";

@Injectable()
export class EmployeesService {
  constructor(
    @InjectRepository(Employee)
    private readonly employeeRepository: Repository<Employee>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private readonly notificationGateway: NotificationGateway,
  ) {}

  create(createEmployeeDto: CreateEmployeeDto) {
    return 'This action adds a new employee'
  }

  findAll() {
    return `This action returns all employees`
  }

  findOne(id: number) {
    return `This action returns a #${id} employee`
  }

  update(id: number, updateEmployeeDto: UpdateEmployeeDto) {
    return `This action updates a #${id} employee`
  }

  remove(id: number) {
    return `This action removes a #${id} employee`
  }
}
