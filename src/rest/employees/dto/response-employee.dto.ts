import { Exclude, Expose } from 'class-transformer'

export class ResponseEmployeeDto {
  @Expose()
  id: number

  @Expose()
  name: string

  @Expose()
  salary: number

  @Expose()
  position: string

  @Expose()
  email: string

  @Exclude()
  password!: string

  @Expose()
  createdAt: Date

  @Expose()
  updatedAt: Date

  @Expose()
  isDeleted: boolean
}
