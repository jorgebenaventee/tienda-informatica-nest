import { ApiProperty } from '@nestjs/swagger'

export class ResponseSupplierDto {
  @ApiProperty({
    example: 'f5b5f2a0-0fda-4f1e-8a5f-0fbd4d9d9c6e',
    description: 'The id of the supplier',
  })
  id: string
  @ApiProperty({
    example: 'John Doe',
    description: 'The name of the supplier',
  })
  name: string
  @ApiProperty({
    example: 1234567890,
    description: 'The contact of the supplier',
  })
  contact: number
  @ApiProperty({
    example: 'Calle 123',
    description: 'The address of the supplier',
  })
  address: string
  @ApiProperty({
    example: '2021-09-16T03:45:39.898Z',
    description: 'The date of hiring of the supplier',
  })
  hired_at: Date
  @ApiProperty({
    example: 'PC',
    description: 'The category of the supplier',
  })
  category: string
  @ApiProperty({
    example: 'false',
    description: 'The status of the supplier',
  })
  is_deleted?: boolean
}
