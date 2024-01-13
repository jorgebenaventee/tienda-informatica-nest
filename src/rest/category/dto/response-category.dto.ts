import {
  IsBoolean,
  IsDate,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator'
import { Transform } from 'class-transformer'

export class ResponseCategoryDto {
  id: string
  @IsNotEmpty({ message: 'Name cannot be empty' })
  @IsString({ message: 'Name must be a string' })
  @Transform(({ value }) => value.trim())
  name: string
  @IsDate()
  createdAt: Date
  @IsDate()
  updatedAt: Date
  @IsOptional()
  @IsBoolean()
  isActive?: boolean
}
