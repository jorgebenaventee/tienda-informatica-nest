import {
  IsBoolean,
  IsDate,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator'
import { Transform } from 'class-transformer'
import { ApiProperty } from '@nestjs/swagger'

export class ResponseCategoryDto {
  @ApiProperty({ description: 'The id of the category' })
  id: string

  @ApiProperty({ description: 'The name of the category' })
  @IsNotEmpty({ message: 'Name cannot be empty' })
  @IsString({ message: 'Name must be a string' })
  @Transform(({ value }) => value.trim())
  name: string

  @ApiProperty({ description: 'The creation date of the category' })
  @IsDate()
  createdAt: Date

  @ApiProperty({ description: 'The update date of the category' })
  @IsDate()
  updatedAt: Date

  @ApiProperty({
    description: 'The active status of the category',
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean
}
