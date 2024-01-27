import { IsNotEmpty, IsPositive, IsString } from "class-validator";

export class CreateEmployeeDto {

  @IsNotEmpty({ message: 'Name cannot be empty' })
  @IsString({ message: 'Name must be a string' })
  name: string

  @IsPositive({ message: 'Salary must be a positive number' })
  @IsNotEmpty({ message: 'Salary cannot be empty' })
  salary: number

  @IsNotEmpty({ message: 'Position cannot be empty' })
  @IsString({ message: 'Position must be a string' })
  position: string


}
