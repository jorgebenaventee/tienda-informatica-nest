import { Transform } from 'class-transformer'
import {
  IsBoolean,
  IsDate,
  IsNotEmpty,
  IsOptional,
  IsPositive,
  IsString,
} from 'class-validator'

export class CreateSupplierDto {
  @Transform(({ value }) => value.trim())
  @IsNotEmpty({ message: 'Name cannot be empty' })
  @IsString({ message: 'Name must be a string' })
  name: string
  @IsNotEmpty({ message: 'Contact cannot be empty' })
  @IsPositive({ message: 'Contact must be a positive number' })
  contact: number
  @Transform(({ value }) => value.trim())
  @IsNotEmpty({ message: 'Address cannot be empty' })
  @IsString({ message: 'Address must be a string' })
  address: string
  @IsNotEmpty({ message: 'Hired_at cannot be empty' })
  @IsDate({ message: 'Hired_at must be a date' })
  @IsOptional()
  hired_at: Date
  @IsString({ message: 'Category must be a string' })
  @Transform(({ value }) => value.trim())
  @IsNotEmpty({ message: 'Category cannot be empty' })
  category: string
  @IsBoolean({ message: 'Is_deleted must be a boolean' })
  @IsOptional()
  is_deleted?: boolean
}
