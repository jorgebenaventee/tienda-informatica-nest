import { Injectable } from '@nestjs/common'
import { plainToClass } from 'class-transformer'
import { ResponseEmployeeDto } from '../dto/response-employee.dto'
import { Employee } from '../entities/employee.entity'
import { CreateEmployeeDto } from '../dto/create-employee.dto'
import { UpdateEmployeeDto } from '../dto/update-employee.dto'

@Injectable()
export class EmployeesMapper {
  toDto(emplyee: Employee): ResponseEmployeeDto {
    const responseProductDto = plainToClass(ResponseEmployeeDto, emplyee)
    return responseProductDto
  }

  toEntity(employeeDto: CreateEmployeeDto | UpdateEmployeeDto): Employee {
    const employee = plainToClass(Employee, employeeDto)
    return employee
  }
}
