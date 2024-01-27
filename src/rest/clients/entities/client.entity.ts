import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm'
import { IsEmail, IsInt, IsNotEmpty, IsString } from 'class-validator'

@Entity('clients')
export class Client {
  @PrimaryGeneratedColumn()
  @IsInt()
  id: number
  @Column({ type: 'varchar', nullable: false, length: 255 })
  @IsString()
  @IsNotEmpty()
  name: string
  @Column({ type: 'varchar', nullable: false, length: 255 })
  @IsString()
  @IsEmail()
  @IsNotEmpty()
  email: string
  @Column({ type: 'varchar', nullable: false, length: 255 })
  @IsString()
  @IsNotEmpty()
  password: string
}
