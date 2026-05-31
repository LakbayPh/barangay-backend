import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';
import { JwtPayload } from 'src/common/types/jwt-payload.type';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { SensitiveDataService } from '../common/security/sensitive-data.service';
import { Prisma, UserRole } from '@prisma/client';
import { AuthTokenResponseDto } from './dto/auth-token-response.dto';
import { AccountResponseDto } from './dto/account-response.dto';
import { RegisterResponseDto } from './dto/register-response.dto';
import { formatUserAccountId } from '../users/account-id.util';

const PASSWORD_SALT_ROUNDS = 12;

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
    private readonly sensitiveData: SensitiveDataService,
  ) {}

  async register(dto: RegisterDto): Promise<RegisterResponseDto> {
    const email = this.normalizeEmail(dto.email);
    const emailHash = this.sensitiveData.createLookupHash(email);
    const passwordHash = await bcrypt.hash(dto.password, PASSWORD_SALT_ROUNDS);

    try {
      await this.prisma.user.create({
        data: {
          emailEncrypted: this.sensitiveData.encrypt(email),
          emailHash,
          passwordHash,
          role: UserRole.STAFF,
        },
      });

      return {
        success: true,
      };
    } catch (error) {
      if (this.isUniqueConstraintError(error)) {
        throw new ConflictException('Account already exists');
      }

      throw error;
    }
  }

  async login(dto: LoginDto): Promise<AuthTokenResponseDto> {
    const email = this.normalizeEmail(dto.email);
    const emailHash = this.sensitiveData.createLookupHash(email);

    const user = await this.prisma.user.findUnique({
      where: {
        emailHash,
      },
      select: {
        id: true,
        passwordHash: true,
        role: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isValid = await bcrypt.compare(dto.password, user.passwordHash);

    if (!isValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.createAccessToken(user.id, user.role);
  }

  async getAccount(userId: string): Promise<AccountResponseDto> {
    const user = await this.prisma.user.findUnique({
      where: {
        id: userId,
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

    if (!user) {
      throw new UnauthorizedException();
    }

    return {
      id: user.id,
      accountId: formatUserAccountId(user.accountNumber),
      email: this.sensitiveData.decrypt(user.emailEncrypted),
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  private async createAccessToken(
    userId: string,
    role: UserRole,
  ): Promise<AuthTokenResponseDto> {
    const payload: JwtPayload = {
      sub: userId,
      role,
    };

    return {
      access_token: await this.jwtService.signAsync(payload),
    };
  }

  private normalizeEmail(email: string): string {
    return email.trim().toLowerCase();
  }

  private isUniqueConstraintError(
    error: unknown,
  ): error is Prisma.PrismaClientKnownRequestError {
    return (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002'
    );
  }
}
