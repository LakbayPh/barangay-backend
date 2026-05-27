import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';

describe('AuthService', () => {
  let service: AuthService;
  const jwtService = {
    signAsync: jest.fn(),
  };
  const prismaService = {
    user: {
      findUnique: jest.fn(),
    },
  };

  beforeEach(async () => {
    jest.clearAllMocks();

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
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return an access token for valid credentials', async () => {
    const passwordHash = await bcrypt.hash('123456', 10);

    prismaService.user.findUnique.mockResolvedValue({
      id: '1',
      email: 'admin@test.com',
      passwordHash,
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
  });
});
