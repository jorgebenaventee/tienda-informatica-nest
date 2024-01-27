import { Column, CreateDateColumn, Entity, PrimaryColumn } from 'typeorm'
import {
  IsBoolean,
  IsDate,
  IsEmail,
  IsNotEmpty,
  IsPositive,
  IsString,
} from 'class-validator'

@Entity('employees')
export class Employee {
  @PrimaryColumn({ type: 'int' })
  id: number
  @Column({ type: 'varchar', nullable: false, length: 255 })
  @IsNotEmpty({ message: 'Name cannot be empty' })
  @IsString({ message: 'Name must be a string' })
  name: string
  @Column({ type: 'decimal', default: 0.0 })
  @IsPositive({ message: 'Salary must be a positive number' })
  @IsNotEmpty({ message: 'Salary cannot be empty' })
  salary: number
  @Column({ type: 'varchar', nullable: false, length: 255 })
  @IsNotEmpty({ message: 'Position cannot be empty' })
  @IsString({ message: 'Position must be a string' })
  position: string
  @Column({ type: 'varchar', nullable: false, length: 255 })
  @IsEmail()
  @IsNotEmpty({ message: 'Email cannot be empty' })
  @IsString({ message: 'Email must be a string' })
  email: string
  @Column({ type: 'varchar', nullable: false, length: 255 })
  @IsNotEmpty({ message: 'Password cannot be empty' })
  @IsString({ message: 'Password must be a string' })
  password: string
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
}
