import { Injectable } from '@nestjs/common'
import { Client } from '../entities/client.entity'
import { ClientResponseDto } from '../dto/client-response.dto'
import { CreateClientDto } from '../dto/create-client.dto'
import { UpdateClientDto } from '../dto/update-client.dto'

@Injectable()
export class ClientMapper {
  fromEntity(client: Client): ClientResponseDto {
    return {
      id: client.id,
      name: client.name,
      email: client.email,
    }
  }

  toEntity(dto: CreateClientDto | UpdateClientDto): Client {
    const client = new Client()
    if (dto.name) client.name = dto.name
    if (dto.email) client.email = dto.email
    if (dto.password) client.password = dto.password
    return client
  }
}
