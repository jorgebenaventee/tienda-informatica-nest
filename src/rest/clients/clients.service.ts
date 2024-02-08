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

/**
 * Servicio inyectable para gestionar clientes.
 *
 * @class
 * @constructor
 * @param {Repository<Client>} clientRepository - Repositorio para entidades Client.
 * @param {Repository<Employee>} employeeRepository - Repositorio para entidades Employee.
 * @param {ClientMapper} clientMapper - Mapper para la transformación entre DTO y entidades.
 * @param {Cache} cacheManager - Gestor de caché para almacenar datos en caché.
 */
@Injectable()
export class ClientsService {
  constructor(
    @InjectRepository(Client) private clientRepository: Repository<Client>,
    @InjectRepository(Employee)
    private employeeRepository: Repository<Employee>,
    private clientMapper: ClientMapper,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  /**
   * Crea un nuevo cliente.
   *
   * @async
   * @function
   * @param {CreateClientDto} createClientDto - Datos para crear un nuevo cliente.
   * @throws {BadRequestException} Lanza una excepción si el correo electrónico ya existe...
   * @returns {Promise<ClientResponseDto>} El cliente creado.
   */
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

  /**
   * Encuentra todos los clientes basados en parámetros de paginación...
   *
   * @async
   * @function
   * @param {PaginateQuery} query - Parámetros de consulta de paginación...
   * @returns {Promise<Paginated<ClientResponseDto>>} Lista paginada de clientes.
   */
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

  /**
   * Encuentra un cliente por ID.
   *
   * @async
   * @function
   * @param {number} id - El ID del cliente a buscar.
   * @throws {NotFoundException} Lanza una excepción si el cliente no se encuentra.
   * @returns {Promise<ClientResponseDto>} El cliente encontrado.
   */
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

  /**
   * Actualiza un cliente por ID.
   *
   * @async
   * @function
   * @param {number} id - El ID del cliente a actualizar.
   * @param {UpdateClientDto} updateClientDto - Datos para actualizar el cliente.
   * @throws {BadRequestException} Lanza una excepción si el correo electrónico ya existe...
   * @throws {NotFoundException} Lanza una excepción si el cliente no se encuentra.
   * @returns {Promise<ClientResponseDto>} El cliente actualizado.
   */
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

  /**
   * Elimina un cliente por ID.
   *
   * @async
   * @function
   * @param {number} id - El ID del cliente a eliminar.
   * @throws {NotFoundException} Lanza una excepción si el cliente no se encuentra.
   */
  async remove(id: number) {
    const client = await this.clientRepository.findOne({ where: { id } })
    if (!client) {
      throw new NotFoundException(`Client with id ${id} not found`)
    }
    await this.clientRepository.remove(client)
    await this.invalidateCache(`client_${id}`)
  }
 /**
   * Invalida la caché basada en el patrón de clave especificado.
   *
   * @async
   * @function
   * @param {string} keyPattern - El patrón para hacer coincidir las claves de la caché a eliminar.
   * @returns {Promise<void>} Una promesa que indica la finalización de la invalidación de la caché.
   */
  async invalidateCache(keyPattern: string): Promise<void> {
    const cacheKeys = await this.cacheManager.store.keys()
    const keysToDelete = cacheKeys.filter((key) => key.startsWith(keyPattern))
    const promises = keysToDelete.map((key) => this.cacheManager.del(key))
    await Promise.all(promises)
  }
  /**
   * Encuentra un cliente por correo electrónico.
   *
   * @async
   * @function
   * @param {string} email - El correo electrónico del cliente a buscar.
   * @returns {Promise<Client | null>} El cliente encontrado o nulo si no se encuentra.
   */
  async findByEmail(email: string) {
    const client = await this.clientRepository.findOne({ where: { email } })
    if (!client) {
      return null
    }
    return client
  }
}
