import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryColumn,
} from 'typeorm'
import { Product } from '../../products/entities/product.entity'
import {
  IsBoolean,
  IsDate,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator'
import { v4 as uuidv4 } from 'uuid'
import { Supplier } from '../../suppliers/entities/supplier.entity'

@Entity('categories')
export class Category {
  @PrimaryColumn({ type: 'uuid' })
  @IsUUID('4', { message: 'Id must be a UUID' })
  id: string = uuidv4()
  @Column({ type: 'varchar', nullable: false, unique: true, length: 255 })
  @IsNotEmpty({ message: 'Name cannot be empty' })
  @IsString({ message: 'Name must be a string' })
  name: string
  @CreateDateColumn({
    type: 'timestamp',
    name: 'created_at',
    default: () => 'CURRENT_TIMESTAMP',
  })
  @IsDate()
  createdAt: Date
  @CreateDateColumn({
    type: 'timestamp',
    name: 'updated_at',
    default: () => 'CURRENT_TIMESTAMP',
  })
  @IsDate()
  updatedAt: Date
  @IsOptional()
  @Column({ type: 'boolean', default: true, name: 'is_active' })
  @IsBoolean()
  isActive?: boolean

  @OneToMany(() => Product, (products) => products.category)
  products: Product[]

  @OneToMany(() => Supplier, (supplier) => supplier.category)
  suppliers: Supplier[]
}
