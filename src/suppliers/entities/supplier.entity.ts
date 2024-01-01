import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
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
import { Transform } from 'class-transformer'
import { Category } from '../../category/entities/category.entity'
import { Product } from '../../products/entities/product.entity'

@Entity('suppliers')
export class Supplier {
  @PrimaryColumn({ type: 'uuid' })
  @IsUUID('4', { message: 'The id must be a UUID' })
  id: string = uuidv4()
  @Column({ type: 'varchar', nullable: false, length: 255 })
  @Transform(({ value }) => value.trim())
  @IsNotEmpty({ message: 'Name cannot be empty' })
  @IsString({ message: 'Name must be a string' })
  name: string
  @Column({ type: 'integer', default: 0 })
  @IsNotEmpty({ message: 'Contact cannot be empty' })
  @IsPositive({ message: 'Contact must be a positive number' })
  contact: number
  @Column({ type: 'varchar', nullable: false, length: 255 })
  @Transform(({ value }) => value.trim())
  @IsNotEmpty({ message: 'Address cannot be empty' })
  @IsString({ message: 'Address must be a string' })
  address: string
  @Column({ type: 'date', nullable: false })
  @IsDate({ message: 'Hired_at must be a date' })
  @CreateDateColumn({
    type: 'timestamp',
    name: 'hired_at',
    default: () => 'CURRENT_TIMESTAMP',
  })
  hired_at: Date
  @ManyToOne(() => Category, (category) => category.products)
  @JoinColumn({ name: 'category_id' })
  category: Category
  @IsBoolean({ message: 'Is deleted must be a boolean' })
  @Column({ type: 'boolean', default: false, name: 'is_deleted' })
  is_deleted: boolean
  @OneToMany(() => Product, (product) => product.supplier)
  products: Product[]
}
