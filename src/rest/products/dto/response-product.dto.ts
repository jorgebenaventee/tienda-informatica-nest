import { v4 as uuidv4 } from 'uuid'
import { ApiProperty } from '@nestjs/swagger'

export class ResponseProductDto {
  @ApiProperty({
    example: 'f5b5f2a0-0fda-4f1e-8a5f-0fbd4d9d9c6e',
    description: 'The id of the product',
  })
  id: string = uuidv4()

  @ApiProperty({
    example: 'PC Gamer',
    description: 'The name of the product',
  })
  name: string

  @ApiProperty({
    example: 5,
    description: 'The weight of the product',
  })
  weight: number

  @ApiProperty({
    example: 1000,
    description: 'The price of the product',
  })
  price: number

  @ApiProperty({
    example: 'https://picsum.photos/200/300',
    description: 'The image of the product',
  })
  image: string

  @ApiProperty({
    example: 10,
    description: 'The stock of the product',
  })
  stock: number

  @ApiProperty({
    example: 'A powerful PC',
    description: 'The description of the product',
  })
  description: string

  @ApiProperty({
    example: '2021-09-16T03:45:39.898Z',
    description: 'The date of creation of the product',
  })
  createdAt: Date

  @ApiProperty({
    example: '2021-09-16T03:45:39.898Z',
    description: 'The date of the last update of the product',
  })
  updatedAt: Date

  @ApiProperty({
    example: false,
    description: 'The status of the product',
  })
  isDeleted: boolean

  @ApiProperty({
    example: 'PC',
    description: 'The category of the product',
  })
  category: string

  @ApiProperty({
    example: 'f5b5f2a0-0fda-4f1e-8a5f-0fbd4d9d9c6e',
    description: 'The id of the supplier',
  })
  supplier: string
}
