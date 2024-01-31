import { ApiProperty, PartialType } from '@nestjs/swagger'
import { CreateOrderDto } from './create-order.dto'
import { IsNotEmpty, IsNumber } from 'class-validator'
import { CreateClientDto } from './create-client.dto'
import { CreateOrderLineDto } from './create-orderLine.dto'

export class UpdateOrderDto extends PartialType(CreateOrderDto) {
  @ApiProperty({ description: 'The user ID associated with the order' })
  @IsNumber()
  @IsNotEmpty()
  userId: number

  @ApiProperty({
    description: 'The client details for the order',
    type: CreateClientDto,
  })
  @IsNotEmpty()
  client: CreateClientDto

  @ApiProperty({
    description: 'The order line items for the order',
    type: [CreateOrderLineDto],
  })
  @IsNotEmpty()
  orderLines: CreateOrderLineDto[]
}
