import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';
import { JwtPayload } from 'src/common/types/jwt-payload.type';

type User = {
  id: string;
  email: string;
  passwordHash: string;
};

@Injectable()
export class AuthService {
  constructor(private readonly jwtService: JwtService) {}

  private async getMockUser(): Promise<User> {
    const passwordHash = await bcrypt.hash('123456', 10);

    return {
      id: '1',
      email: 'admin@test.com',
      passwordHash,
    };
  }

  async login(dto: LoginDto): Promise<{ access_token: string }> {
    const user = await this.getMockUser();

    if (user.email !== dto.email) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isValid = await bcrypt.compare(dto.password, user.passwordHash);

    if (!isValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload: JwtPayload = {
      email: user.email,
      sub: user.id,
    };

    return {
      access_token: await this.jwtService.signAsync(payload),
    };
  }
}
