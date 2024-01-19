import { PartialType } from '@nestjs/mapped-types'
import { CreateProductDto } from './create-product.dto'
import { IsBoolean, IsOptional, IsPositive, IsString } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'

export class UpdateProductDto extends PartialType(CreateProductDto) {
  @IsString({ message: 'Image must be a string' })
  @IsOptional()
  @ApiProperty({
    example: 'https://picsum.photos/200/300',
    description: 'The image of the product',
    type: String,
    required: false,
  })
  image?: string

  @IsPositive({ message: 'Stock must be a positive number' })
  @ApiProperty({
    example: 10,
    description: 'The stock of the product',
    type: Number,
    required: false,
  })
  stock?: number

  @IsString({ message: 'Description must be a string' })
  @ApiProperty({
    example: 'A powerful PC',
    description: 'The description of the product',
    type: String,
    required: false,
  })
  description?: string

  @IsBoolean()
  @IsOptional()
  @ApiProperty({
    example: false,
    description: 'The status of the product',
    type: Boolean,
    required: false,
  })
  isDeleted?: boolean
}
