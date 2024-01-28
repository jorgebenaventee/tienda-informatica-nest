import { Module } from '@nestjs/common'
import { JwtModule } from '@nestjs/jwt'
import { PassportModule } from '@nestjs/passport'
import { AuthService } from './auth.service'
import { ClientsModule } from '../clients/clients.module'
import { EmployeesModule } from '../employees/employees.module'
import { AuthController } from './auth.controller'
import { JwtAuthStrategy } from './jwt-auth-strategy'

@Module({
  imports: [
    JwtModule.register({
      secret: btoa('ClownsInformaticsTokenUltraSecret1234'),
      signOptions: {
        algorithm: 'HS512',
        expiresIn: 3600,
      },
    }),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    ClientsModule,
    EmployeesModule,
  ],
  providers: [AuthService, JwtAuthStrategy],
  controllers: [AuthController],
})
export class AuthModule {}
