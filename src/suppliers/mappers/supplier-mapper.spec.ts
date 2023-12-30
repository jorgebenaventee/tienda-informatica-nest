import { Test, TestingModule } from '@nestjs/testing'
import { SupplierMapper } from './supplier-mapper'

describe('Mappers', () => {
  let provider: SupplierMapper

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SupplierMapper],
    }).compile()

    provider = module.get<SupplierMapper>(SupplierMapper)
  })

  it('should be defined', () => {
    expect(provider).toBeDefined()
  })
})
