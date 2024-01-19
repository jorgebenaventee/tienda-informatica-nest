import { Transform } from 'class-transformer'
import { IsNotEmpty, IsString } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'

export class CreateCategoryDto {
  @IsNotEmpty({ message: 'Name cannot be empty' })
  @IsString({ message: 'Name must be a string' })
  @Transform(({ value }) => value.trim())
  @ApiProperty({
    example: 'PC',
    description: 'The name of the category',
  })
  name: string
}
