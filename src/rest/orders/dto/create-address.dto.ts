import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsPositive, IsString, MaxLength } from 'class-validator'

export class CreateAddressDto {
  @ApiProperty({ description: 'The street of the address', maxLength: 100 })
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  street: string

  @ApiProperty({ description: 'The number of the address', maxLength: 50 })
  @IsNotEmpty()
  @IsPositive()
  @MaxLength(50)
  number: number

  @ApiProperty({ description: 'The city of the address', maxLength: 100 })
  @IsNotEmpty()
  @MaxLength(100)
  @IsString()
  city: string

  @ApiProperty({ description: 'The province of the address', maxLength: 100 })
  @IsString()
  @MaxLength(100)
  @IsNotEmpty()
  province: string

  @ApiProperty({ description: 'The country of the address', maxLength: 100 })
  @IsString()
  @MaxLength(100)
  @IsNotEmpty()
  country: string

  @ApiProperty({ description: 'The zip code of the address', maxLength: 5 })
  @IsPositive()
  @MaxLength(5)
  @IsNotEmpty()
  zip: number
}
