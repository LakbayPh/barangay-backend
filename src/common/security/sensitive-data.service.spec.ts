import { ConfigService } from '@nestjs/config';
import { SensitiveDataService } from './sensitive-data.service';

describe('SensitiveDataService', () => {
  const config = {
    getOrThrow: jest
      .fn()
      .mockReturnValue('MDEyMzQ1Njc4OWFiY2RlZjAxMjM0NTY3ODlhYmNkZWY='),
  } as unknown as ConfigService;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should encrypt and decrypt a value', () => {
    const service = new SensitiveDataService(config);

    const encrypted = service.encrypt('admin@test.com');

    expect(encrypted).not.toBe('admin@test.com');
    expect(service.decrypt(encrypted)).toBe('admin@test.com');
  });

  it('should create stable lookup hashes without exposing the value', () => {
    const service = new SensitiveDataService(config);

    const firstHash = service.createLookupHash('admin@test.com');
    const secondHash = service.createLookupHash('admin@test.com');

    expect(firstHash).toBe(secondHash);
    expect(firstHash).not.toContain('admin@test.com');
  });
});
