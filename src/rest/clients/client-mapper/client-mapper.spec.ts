import { Test, TestingModule } from '@nestjs/testing';
import { ClientMapper } from './client-mapper';

describe('ClientMapper', () => {
  let provider: ClientMapper;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ClientMapper],
    }).compile();

    provider = module.get<ClientMapper>(ClientMapper);
  });

  it('should be defined', () => {
    expect(provider).toBeDefined();
  });
});
