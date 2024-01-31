import { ApiProperty } from '@nestjs/swagger'
import {
  IsEmail,
  IsNotEmpty,
  IsPositive,
  IsString,
  MaxLength,
} from 'class-validator'
import { CreateAddressDto } from './create-address.dto'

export class CreateClientDto {
  @ApiProperty({ description: 'The name of the client', maxLength: 100 })
  @IsString()
  @MaxLength(100)
  @IsNotEmpty()
  name: string

  @ApiProperty({ description: 'The email of the client', maxLength: 100 })
  @IsString()
  @MaxLength(100)
  @IsEmail()
  email: string

  @ApiProperty({ description: 'The phone number of the client', maxLength: 9 })
  @IsPositive()
  @MaxLength(9)
  @IsNotEmpty()
  phone: number

  @ApiProperty({
    description: 'The address of the client',
    type: CreateAddressDto,
  })
  @IsNotEmpty()
  address: CreateAddressDto
}
