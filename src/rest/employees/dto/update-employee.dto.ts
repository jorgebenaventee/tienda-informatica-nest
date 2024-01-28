import { PartialType } from '@nestjs/swagger'
import { CreateEmployeeDto } from './create-employee.dto'
import { IsNotEmptyObject } from 'class-validator'

export class UpdateEmployeeDto extends PartialType(CreateEmployeeDto) {}
