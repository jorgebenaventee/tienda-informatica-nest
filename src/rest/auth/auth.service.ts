import { Injectable, UnauthorizedException } from '@nestjs/common'
import { EmployeesService } from '../employees/services/employees.service'
import { ClientsService } from '../clients/clients.service'
import { ClientMapper } from '../clients/client-mapper/client-mapper'
import { EmployeesMapper } from '../employees/mapper/employees.mapper'
import { JwtService } from '@nestjs/jwt'
import { compare } from 'bcryptjs'
import { CreateClientDto } from '../clients/dto/create-client.dto'
import { SignInDto } from './dto/signInDto'
import { Employee } from '../employees/entities/employee.entity'
import { Client } from '../clients/entities/client.entity'

@Injectable()
export class AuthService {
  constructor(
    private employeeService: EmployeesService,
    private clientService: ClientsService,
    private jwtService: JwtService,
    private clientMapper: ClientMapper,
    private employeeMapper: EmployeesMapper,
  ) {}

  async signUp(createClientDto: CreateClientDto) {
    const client = await this.clientService.create(createClientDto)
    const accessToken = this.getAccessToken(client.email)
    return {
      accessToken,
    }
  }

  async signIn(signInDto: SignInDto) {
    const { email, password } = signInDto
    const user = await this.validateUser(email)
    if (!user) {
      throw new UnauthorizedException('Invalid credentials')
    }
    const isPasswordValid = await this.validatePassword(password, user.password)
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials')
    }
    const accessToken = this.getAccessToken(email)
    return {
      accessToken,
    }
  }

  async getProfile({ user }: { user: User }) {
    if (user.role === 'client') {
      return this.clientMapper.fromEntity(user)
    }
    return this.employeeMapper.toDto(user)
  }

  async validateUser(email: string): Promise<User | null> {
    const client = await this.clientService.findByEmail(email)
    if (client) {
      return {
        ...client,
        role: 'client',
      }
    }
    const employee = await this.employeeService.findByEmail(email)
    if (employee) {
      return {
        ...employee,
        role: 'employee',
      }
    }
    return null
  }

  private getAccessToken(email: string) {
    const payload = { email }
    return this.jwtService.sign(payload)
  }

  private validatePassword(password: string, hashedPassword: string) {
    return compare(password, hashedPassword)
  }
}

export type User =
  | (Client & { role: 'client' })
  | (Employee & { role: 'employee' })
