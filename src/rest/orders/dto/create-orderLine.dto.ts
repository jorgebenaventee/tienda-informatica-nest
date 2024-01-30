import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsNumber, IsPositive, IsUUID } from 'class-validator'

export class CreateOrderLineDto {
  @ApiProperty({ description: 'The quantity of the product', example: 1 })
  @IsNumber()
  @IsNotEmpty()
  @IsPositive()
  quantity: number

  @ApiProperty({
    description: 'The product ID',
    example: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
  })
  @IsUUID()
  @IsNotEmpty()
  productId: string

  @ApiProperty({ description: 'The price of the product', example: 100.5 })
  @IsNumber()
  @IsNotEmpty()
  @IsPositive()
  productPrice: number

  @ApiProperty({
    description: 'The total price for the quantity of product',
    example: 100.5,
  })
  @IsNumber()
  @IsNotEmpty()
  @IsPositive()
  total: number
}
