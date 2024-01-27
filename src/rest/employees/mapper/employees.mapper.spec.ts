import { Test, TestingModule } from '@nestjs/testing'
import { EmployeesMapper } from './employees.mapper'

describe('Mapper', () => {
  let provider: EmployeesMapper

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EmployeesMapper],
    }).compile()

    provider = module.get<EmployeesMapper>(EmployeesMapper)
  })

  it('should be defined', () => {
    expect(provider).toBeDefined()
  })
})
