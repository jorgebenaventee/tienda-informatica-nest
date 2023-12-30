import { IsBoolean, IsNotEmpty, IsOptional, IsPositive, IsString } from 'class-validator'

export class CreateProductDto {
  @IsNotEmpty({ message: 'Name cannot be empty' })
  @IsString({ message: 'Name must be a string' })
  name: string
  @IsPositive({ message: 'Weight must be a positive number' })
  @IsNotEmpty({ message: 'Weight cannot be empty' })
  weight: number
  @IsPositive({ message: 'Price must be a positive number' })
  @IsNotEmpty({ message: 'Price cannot be empty' })
  price: number
  @IsString({ message: 'Image must be a string' })
  @IsOptional()
  image?: string
  @IsNotEmpty({ message: 'Stock cannot be empty' })
  @IsPositive({ message: 'Stock must be a positive number' })
  stock: number
  @IsNotEmpty({ message: 'Description cannot be empty' })
  @IsString({ message: 'Description must be a string' })
  description: string
  @IsBoolean()
  @IsOptional()
  isDeleted?: boolean
  category: string
}
