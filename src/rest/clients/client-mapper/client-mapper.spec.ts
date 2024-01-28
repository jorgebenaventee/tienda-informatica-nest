import { ClientMapper } from './client-mapper'
import { TestBed } from '@automock/jest'
import {
  client,
  clientResponseDto,
  createClientDto,
  updateClientDto,
} from '../mocks'

describe('ClientMapper', () => {
  let provider: ClientMapper

  beforeEach(async () => {
    const { unit } = TestBed.create(ClientMapper).compile()

    provider = unit
  })

  it('should be defined', () => {
    expect(provider).toBeDefined()
  })

  it('should map from entity', () => {
    const response = provider.fromEntity(client)
    expect(response).toEqual(clientResponseDto)
  })

  describe('should map to entity', () => {
    it('from create', async () => {
      const response = await provider.toEntity(createClientDto)
      expect(response.email).toEqual(client.email)
      expect(response.name).toEqual(client.name)
    })

    it('from update', async () => {
      const response = await provider.toEntity(updateClientDto, client)
      expect(response.email).toEqual(client.email)
      expect(response.name).toEqual(updateClientDto.name)
      expect(response.id).toEqual(client.id)
    })
  })
})
