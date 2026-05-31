import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { ListUsersQueryDto } from './dto/list-users-query.dto';
import { ListUsersResponseDto } from './dto/list-users-response.dto';
import { UsersService } from './users.service';

@ApiTags('users')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @ApiOperation({ summary: 'List user accounts' })
  @ApiOkResponse({
    description: 'User accounts returned.',
    type: ListUsersResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'The query parameters failed validation.',
  })
  @ApiUnauthorizedResponse({
    description: 'The access token is missing, invalid, or expired.',
  })
  @ApiForbiddenResponse({
    description: 'The authenticated account does not have permission.',
  })
  @Get()
  listUsers(@Query() query: ListUsersQueryDto): Promise<ListUsersResponseDto> {
    return this.usersService.listUsers(query);
  }
}
