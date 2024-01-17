import { IsNotEmpty, IsNumber, IsPositive, IsUUID } from 'class-validator'

export class CreateOrderLineDto {
  @IsNumber()
  @IsNotEmpty()
  @IsPositive()
  quantity: number

  @IsUUID()
  @IsNotEmpty()
  productId: string

  @IsNumber()
  @IsNotEmpty()
  @IsPositive()
  productPrice: number

  @IsNumber()
  @IsNotEmpty()
  @IsPositive()
  total: number
}
