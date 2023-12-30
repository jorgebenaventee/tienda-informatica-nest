import { IsBoolean, IsDate, IsNotEmpty, IsOptional, IsString } from 'class-validator'

export class ResponseCategoryDto {
  id: string
  @IsNotEmpty({ message: 'Name cannot be empty' })
  @IsString({ message: 'Name must be a string' })
  name: string
  @IsDate()
  createdAt: Date
  @IsDate()
  updatedAt: Date
  @IsOptional()
  @IsBoolean()
  isActive?: boolean
}
