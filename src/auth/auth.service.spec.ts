import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';
import { SensitiveDataService } from '../common/security/sensitive-data.service';

describe('AuthService', () => {
  let service: AuthService;
  const jwtService = {
    signAsync: jest.fn(),
  };
  const prismaService = {
    user: {
      create: jest.fn(),
      findUnique: jest.fn(),
    },
  };
  const sensitiveDataService = {
    encrypt: jest.fn(),
    decrypt: jest.fn(),
    createLookupHash: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    sensitiveDataService.encrypt.mockReturnValue('encrypted-email');
    sensitiveDataService.decrypt.mockReturnValue('admin@test.com');
    sensitiveDataService.createLookupHash.mockReturnValue('email-hash');

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: JwtService,
          useValue: jwtService,
        },
        {
          provide: PrismaService,
          useValue: prismaService,
        },
        {
          provide: SensitiveDataService,
          useValue: sensitiveDataService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a staff user with encrypted email and return success', async () => {
    prismaService.user.create.mockResolvedValue({
      id: '1',
    });

    await expect(
      service.register({
        email: 'Admin@Test.com',
        password: 'password123',
      }),
    ).resolves.toEqual({
      success: true,
    });

    expect(sensitiveDataService.createLookupHash).toHaveBeenCalledWith(
      'admin@test.com',
    );
    expect(sensitiveDataService.encrypt).toHaveBeenCalledWith('admin@test.com');
    expect(prismaService.user.create).toHaveBeenCalledWith({
      data: {
        emailEncrypted: 'encrypted-email',
        emailHash: 'email-hash',
        passwordHash: expect.any(String),
        role: UserRole.STAFF,
      },
    });
    expect(jwtService.signAsync).not.toHaveBeenCalled();
  });

  it('should return an access token for valid credentials', async () => {
    const passwordHash = await bcrypt.hash('123456', 10);

    prismaService.user.findUnique.mockResolvedValue({
      id: '1',
      emailHash: 'email-hash',
      passwordHash,
      role: UserRole.ADMIN,
    });
    jwtService.signAsync.mockResolvedValue('jwt-token');

    await expect(
      service.login({
        email: 'admin@test.com',
        password: '123456',
      }),
    ).resolves.toEqual({
      access_token: 'jwt-token',
    });
    expect(prismaService.user.findUnique).toHaveBeenCalledWith({
      where: {
        emailHash: 'email-hash',
      },
      select: {
        id: true,
        passwordHash: true,
        role: true,
      },
    });
    expect(jwtService.signAsync).toHaveBeenCalledWith({
      sub: '1',
      role: UserRole.ADMIN,
    });
  });

  it('should return decrypted account details for the authenticated user', async () => {
    const createdAt = new Date('2026-05-31T00:00:00.000Z');
    const updatedAt = new Date('2026-05-31T00:00:00.000Z');

    prismaService.user.findUnique.mockResolvedValue({
      id: '1',
      accountNumber: 1,
      emailEncrypted: 'encrypted-email',
      role: UserRole.ADMIN,
      createdAt,
      updatedAt,
    });

    await expect(service.getAccount('1')).resolves.toEqual({
      id: '1',
      accountId: 'MTB-00001',
      email: 'admin@test.com',
      role: UserRole.ADMIN,
      createdAt,
      updatedAt,
    });
    expect(prismaService.user.findUnique).toHaveBeenCalledWith({
      where: {
        id: '1',
      },
      select: {
        id: true,
        accountNumber: true,
        emailEncrypted: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  });
});
