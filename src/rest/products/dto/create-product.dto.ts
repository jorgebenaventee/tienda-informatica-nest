import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsPositive,
  IsString,
  IsUUID,
} from 'class-validator'
import { Transform } from 'class-transformer'
import { ApiProperty } from '@nestjs/swagger'

export class CreateProductDto {
  @IsNotEmpty({ message: 'Name cannot be empty' })
  @IsString({ message: 'Name must be a string' })
  @ApiProperty({
    example: 'PC Gamer',
    description: 'The name of the product',
    type: String,
  })
  name: string

  @IsPositive({ message: 'Weight must be a positive number' })
  @IsNotEmpty({ message: 'Weight cannot be empty' })
  @ApiProperty({
    example: 5,
    description: 'The weight of the product',
    type: Number,
  })
  weight: number

  @IsPositive({ message: 'Price must be a positive number' })
  @IsNotEmpty({ message: 'Price cannot be empty' })
  @ApiProperty({
    example: 1000,
    description: 'The price of the product',
    type: Number,
  })
  price: number

  @IsString({ message: 'Image must be a string' })
  @IsOptional()
  @ApiProperty({
    example: 'https://picsum.photos/200/300',
    description: 'The image of the product',
    type: String,
    required: false,
  })
  image?: string

  @IsNotEmpty({ message: 'Stock cannot be empty' })
  @IsPositive({ message: 'Stock must be a positive number' })
  @ApiProperty({
    example: 10,
    description: 'The stock of the product',
    type: Number,
  })
  stock: number

  @IsNotEmpty({ message: 'Description cannot be empty' })
  @IsString({ message: 'Description must be a string' })
  @ApiProperty({
    example: 'A powerful PC',
    description: 'The description of the product',
    type: String,
  })
  description: string

  @IsBoolean()
  @IsOptional()
  @ApiProperty({
    example: false,
    description: 'The status of the product',
    type: Boolean,
    required: false,
  })
  isDeleted?: boolean

  @Transform(({ value }) => value.trim())
  @IsNotEmpty({ message: 'Category cannot be empty' })
  @IsString({ message: 'Category must be a string' })
  @ApiProperty({
    example: 'PC',
    description: 'The category of the product',
    type: String,
  })
  category: string

  @Transform(({ value }) => value.trim())
  @IsNotEmpty({ message: 'Supplier cannot be empty' })
  @IsUUID('4', { message: 'The id must be a UUID' })
  @ApiProperty({
    example: 'f5b5f2a0-0fda-4f1e-8a5f-0fbd4d9d9c6e',
    description: 'The supplier of the product',
    type: String,
  })
  supplier: string
}
