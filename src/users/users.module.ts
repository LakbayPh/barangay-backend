import { Module } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { SecurityModule } from '../common/security/security.module';
import { PrismaModule } from '../prisma/prisma.module';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
  imports: [PrismaModule, SecurityModule],
  controllers: [UsersController],
  providers: [UsersService, JwtAuthGuard, RolesGuard],
})
export class UsersModule {}
