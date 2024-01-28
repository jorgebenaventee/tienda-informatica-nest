import { Client } from './entities/client.entity'
import { ClientResponseDto } from './dto/client-response.dto'
import { CreateClientDto } from './dto/create-client.dto'
import { UpdateClientDto } from './dto/update-client.dto'

export const client: Client = {
  id: 1,
  name: 'John Doe',
  email: 'johndoe@example.com',
  password: '$2a$05$HYSx6eJ27wiqAI4td700JOJvNolIE1efRxZfe7xpUfs8w9Qt.4O8O',
}

export const createClientDto: CreateClientDto = {
  name: 'John Doe',
  email: 'johndoe@example.com',
  password: '123456',
}

export const updateClientDto: UpdateClientDto = {
  name: 'Jane Doe',
}

export const clientResponseDto: ClientResponseDto = {
  id: 1,
  email: 'johndoe@example.com',
  name: 'John Doe',
}
