import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { CreateClientDto } from './dto/create-client.dto'
import { UpdateClientDto } from './dto/update-client.dto'
import { InjectRepository } from '@nestjs/typeorm'
import { Client } from './entities/client.entity'
import { Repository } from 'typeorm'
import { ClientMapper } from './client-mapper/client-mapper'
import { Employee } from '../employees/entities/employee.entity'
import { CACHE_MANAGER } from '@nestjs/cache-manager'
import { Cache } from 'cache-manager'
import {
  FilterOperator,
  paginate,
  Paginated,
  PaginateQuery,
} from 'nestjs-paginate'
import { hash } from 'typeorm/util/StringUtils'
import { ClientResponseDto } from './dto/client-response.dto'

@Injectable()
export class ClientsService {
  constructor(
    @InjectRepository(Client) private clientRepository: Repository<Client>,
    @InjectRepository(Employee)
    private employeeRepository: Repository<Employee>,
    private clientMapper: ClientMapper,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async create(createClientDto: CreateClientDto) {
    const existsEmployee = await this.employeeRepository.exist({
      where: { email: createClientDto.email },
    })
    const existsClient = await this.clientRepository.exist({
      where: { email: createClientDto.email },
    })
    const exists = existsEmployee || existsClient
    if (exists) {
      throw new BadRequestException('Email already exists')
    }

    const client = await this.clientMapper.toEntity(createClientDto)
    const savedClient = await this.clientRepository.save(client)
    return this.clientMapper.fromEntity(savedClient)
  }

  async findAll(query: PaginateQuery): Promise<Paginated<ClientResponseDto>> {
    const cache = await this.cacheManager.get<Paginated<ClientResponseDto>>(
      `all_clients_${hash(JSON.stringify(query))}`,
    )

    if (cache) {
      return cache
    }

    const page = await paginate(query, this.clientRepository, {
      defaultSortBy: [['id', 'ASC']],
      sortableColumns: ['name', 'email'],
      filterableColumns: {
        name: [FilterOperator.EQ, FilterOperator.ILIKE],
        email: [FilterOperator.EQ, FilterOperator.ILIKE],
      },
    })
    const response = {
      ...page,
      data: page.data.map((client) => this.clientMapper.fromEntity(client)),
    }
    await this.cacheManager.set(
      `all_clients_${hash(JSON.stringify(query))}`,
      response,
      60,
    )
    return response as Paginated<ClientResponseDto>
  }

  async findOne(id: number) {
    const cache = await this.cacheManager.get(`client_${id}`)
    if (cache) {
      return cache
    }
    const client = await this.clientRepository.findOne({ where: { id } })
    if (!client) {
      throw new NotFoundException(`Client with id ${id} not found`)
    }
    const response = this.clientMapper.fromEntity(client)
    await this.cacheManager.set(`client_${id}`, response, 600)
    return response
  }

  async update(id: number, updateClientDto: UpdateClientDto) {
    const existsEmployee = await this.employeeRepository.exist({
      where: { email: updateClientDto.email },
    })
    const existsClient = await this.clientRepository.exist({
      where: { email: updateClientDto.email },
    })
    const exists = existsEmployee || existsClient
    if (exists) {
      throw new BadRequestException('Email already exists')
    }
    const client = await this.clientRepository.findOne({ where: { id } })
    if (!client) {
      throw new NotFoundException(`Client with id ${id} not found`)
    }
    const updatedClient = await this.clientMapper.toEntity(
      updateClientDto,
      client,
    )
    const savedClient = await this.clientRepository.save(updatedClient)
    await this.invalidateCache(`client_${id}`)
    await this.invalidateCache(`all_clients`)
    return this.clientMapper.fromEntity(savedClient)
  }

  async remove(id: number) {
    const client = await this.clientRepository.findOne({ where: { id } })
    if (!client) {
      throw new NotFoundException(`Client with id ${id} not found`)
    }
    await this.clientRepository.remove(client)
    await this.invalidateCache(`client_${id}`)
  }

  async invalidateCache(keyPattern: string): Promise<void> {
    const cacheKeys = await this.cacheManager.store.keys()
    const keysToDelete = cacheKeys.filter((key) => key.startsWith(keyPattern))
    const promises = keysToDelete.map((key) => this.cacheManager.del(key))
    await Promise.all(promises)
  }

  async findByEmail(email: string) {
    const client = await this.clientRepository.findOne({ where: { email } })
    if (!client) {
      return null
    }
    return client
  }
}
