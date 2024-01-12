import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
} from 'typeorm'
import {
  IsBoolean,
  IsDate,
  IsNotEmpty,
  IsPositive,
  IsString,
  IsUUID,
} from 'class-validator'
import { v4 as uuidv4 } from 'uuid'
import { Category } from '../../category/entities/category.entity'

@Entity('products')
export class Product {
  public static IMAGE_DEFAULT = 'https://placehold.co/600x400'
  @PrimaryColumn({ type: 'uuid' })
  @IsUUID('4', { message: 'The id must be a UUID' })
  id: string = uuidv4()
  @Column({ type: 'varchar', nullable: false, length: 255 })
  @IsNotEmpty({ message: 'Name cannot be empty' })
  @IsString({ message: 'Name must be a string' })
  name: string
  @Column({ type: 'decimal', default: 0.0 })
  @IsPositive({ message: 'Weight must be a positive number' })
  @IsNotEmpty({ message: 'Weight cannot be empty' })
  weight: number
  @Column({ type: 'decimal', default: 0.0 })
  @IsPositive({ message: 'Price must be a positive number' })
  @IsNotEmpty({ message: 'Price cannot be empty' })
  price: number
  @IsString({ message: 'Image must be a string' })
  @Column({ type: 'varchar', nullable: true, length: 255 })
  image: string = Product.IMAGE_DEFAULT
  @Column({ type: 'integer', default: 0 })
  @IsNotEmpty({ message: 'Stock cannot be empty' })
  @IsPositive({ message: 'Stock must be a positive number' })
  stock: number
  @Column({ type: 'varchar', nullable: false, length: 255 })
  @IsNotEmpty({ message: 'Description cannot be empty' })
  @IsString({ message: 'Description must be a string' })
  description: string
  @IsDate()
  @CreateDateColumn({
    type: 'timestamp',
    name: 'created_at',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date
  @IsDate()
  @CreateDateColumn({
    type: 'timestamp',
    name: 'updated_at',
    default: () => 'CURRENT_TIMESTAMP',
  })
  updatedAt: Date
  @IsBoolean()
  @Column({ type: 'boolean', default: false, name: 'is_deleted' })
  isDeleted: boolean
  @ManyToOne(() => Category, (category) => category.products)
  @JoinColumn({ name: 'category_id' })
  category: Category
}
