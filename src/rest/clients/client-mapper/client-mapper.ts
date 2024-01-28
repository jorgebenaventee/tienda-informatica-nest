import { Injectable } from '@nestjs/common'
import { Client } from '../entities/client.entity'
import { ClientResponseDto } from '../dto/client-response.dto'
import { CreateClientDto } from '../dto/create-client.dto'
import { UpdateClientDto } from '../dto/update-client.dto'
import * as bcrypt from 'bcryptjs'
import { HASH_ROUNDS } from '../../utils/constants'

@Injectable()
export class ClientMapper {
  fromEntity(client: Client): ClientResponseDto {
    return {
      id: client.id,
      name: client.name,
      email: client.email,
    }
  }

  async toEntity(dto: CreateClientDto): Promise<Client>
  async toEntity(dto: UpdateClientDto, cient: Client): Promise<Client>
  async toEntity(
    dto: CreateClientDto | UpdateClientDto,
    currentClient?: Client,
  ): Promise<Client> {
    const client = currentClient ?? new Client()
    if (dto.name) client.name = dto.name
    if (dto.email) client.email = dto.email
    if (dto.password)
      client.password = await bcrypt.hash(dto.password, HASH_ROUNDS)
    return client
  }
}
