import { Transform } from 'class-transformer'
import {
  IsBoolean,
  IsDate,
  IsNotEmpty,
  IsOptional,
  IsPositive,
  IsString,
} from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'

export class CreateSupplierDto {
  @Transform(({ value }) => value.trim())
  @IsNotEmpty({ message: 'Name cannot be empty' })
  @IsString({ message: 'Name must be a string' })
  @ApiProperty({
    example: 'Juan',
    description: 'The name of the supplier',
  })
  name: string

  @IsNotEmpty({ message: 'Contact cannot be empty' })
  @IsPositive({ message: 'Contact must be a positive number' })
  @ApiProperty({
    example: 123456789,
    description: 'The contact of the supplier',
  })
  contact: number

  @Transform(({ value }) => value.trim())
  @IsNotEmpty({ message: 'Address cannot be empty' })
  @IsString({ message: 'Address must be a string' })
  @ApiProperty({
    example: 'Calle 123',
    description: 'The address of the supplier',
  })
  address: string

  @IsNotEmpty({ message: 'Hired_at cannot be empty' })
  @IsDate({ message: 'Hired_at must be a date' })
  @IsOptional()
  @ApiProperty({
    example: '2021-09-16T03:45:39.898Z',
    description: 'The date of hired of the supplier',
  })
  hired_at: Date

  @IsString({ message: 'Category must be a string' })
  @Transform(({ value }) => value.trim())
  @IsNotEmpty({ message: 'Category cannot be empty' })
  @ApiProperty({
    example: 'PC',
    description: 'The category of the supplier',
  })
  category: string

  @IsBoolean({ message: 'Is_deleted must be a boolean' })
  @IsOptional()
  @ApiProperty({
    example: false,
    description: 'The status of the supplier',
  })
  is_deleted?: boolean
}
