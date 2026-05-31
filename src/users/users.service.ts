import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { SensitiveDataService } from '../common/security/sensitive-data.service';
import { PrismaService } from '../prisma/prisma.service';
import { formatUserAccountId } from './account-id.util';
import { ListUsersQueryDto } from './dto/list-users-query.dto';
import { ListUsersResponseDto } from './dto/list-users-response.dto';

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly sensitiveData: SensitiveDataService,
  ) {}

  async listUsers(query: ListUsersQueryDto): Promise<ListUsersResponseDto> {
    const page = query.page ?? DEFAULT_PAGE;
    const limit = query.limit ?? DEFAULT_LIMIT;
    const where: Prisma.UserWhereInput = query.role
      ? {
          role: query.role,
        }
      : {};

    const [users, total] = await this.prisma.$transaction([
      this.prisma.user.findMany({
        where,
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
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.user.count({
        where,
      }),
    ]);

    return {
      data: users.map((user) => ({
        id: user.id,
        accountId: formatUserAccountId(user.accountNumber),
        email: this.sensitiveData.decrypt(user.emailEncrypted),
        role: user.role,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      })),
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    };
  }
}
