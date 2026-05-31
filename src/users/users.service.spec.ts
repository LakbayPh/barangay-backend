import { Test, TestingModule } from '@nestjs/testing';
import { UserRole } from '@prisma/client';
import { SensitiveDataService } from '../common/security/sensitive-data.service';
import { PrismaService } from '../prisma/prisma.service';
import { UsersService } from './users.service';

describe('UsersService', () => {
  let service: UsersService;
  const prismaService = {
    $transaction: jest.fn(),
    user: {
      findMany: jest.fn(),
      count: jest.fn(),
    },
  };
  const sensitiveDataService = {
    decrypt: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    sensitiveDataService.decrypt.mockReturnValue('staff@test.com');
    prismaService.user.findMany.mockReturnValue('find-many-query');
    prismaService.user.count.mockReturnValue('count-query');

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
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

    service = module.get<UsersService>(UsersService);
  });

  it('should list users with formatted account IDs and decrypted emails', async () => {
    const createdAt = new Date('2026-05-31T00:00:00.000Z');
    const updatedAt = new Date('2026-05-31T00:00:00.000Z');

    prismaService.$transaction.mockResolvedValue([
      [
        {
          id: '1',
          accountNumber: 2,
          emailEncrypted: 'encrypted-email',
          role: UserRole.STAFF,
          createdAt,
          updatedAt,
        },
      ],
      1,
    ]);

    await expect(
      service.listUsers({
        page: 1,
        limit: 20,
        role: UserRole.STAFF,
      }),
    ).resolves.toEqual({
      data: [
        {
          id: '1',
          accountId: 'MTB-00002',
          email: 'staff@test.com',
          role: UserRole.STAFF,
          createdAt,
          updatedAt,
        },
      ],
      page: 1,
      limit: 20,
      total: 1,
      totalPages: 1,
    });

    expect(prismaService.user.findMany).toHaveBeenCalledWith({
      where: {
        role: UserRole.STAFF,
      },
      select: {
        id: true,
        accountNumber: true,
        emailEncrypted: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: {
        accountNumber: 'asc',
      },
      skip: 0,
      take: 20,
    });
    expect(prismaService.user.count).toHaveBeenCalledWith({
      where: {
        role: UserRole.STAFF,
      },
    });
  });
});
