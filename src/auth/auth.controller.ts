import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { Request } from 'express';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { Roles } from './decorators/roles.decorator';
import { JwtPayload } from '../common/types/jwt-payload.type';
import { AuthTokenResponseDto } from './dto/auth-token-response.dto';
import { AccountResponseDto } from './dto/account-response.dto';
import { RegisterResponseDto } from './dto/register-response.dto';

type AuthenticatedRequest = Request & {
  user: JwtPayload;
};

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Create an account' })
  @ApiCreatedResponse({
    description: 'Account created.',
    type: RegisterResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'The request body failed validation.',
  })
  @ApiUnauthorizedResponse({
    description: 'The access token is missing, invalid, or expired.',
  })
  @ApiForbiddenResponse({
    description: 'The authenticated account does not have permission.',
  })
  @ApiConflictResponse({
    description: 'An account with the same email already exists.',
  })
  @Roles(UserRole.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post('register')
  register(@Body() dto: RegisterDto): Promise<RegisterResponseDto> {
    return this.authService.register(dto);
  }

  @ApiOperation({ summary: 'Sign in with email and password' })
  @ApiOkResponse({
    description: 'Access token returned.',
    type: AuthTokenResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'The request body failed validation.',
  })
  @ApiUnauthorizedResponse({
    description: 'The credentials are invalid.',
  })
  @Post('login')
  login(@Body() dto: LoginDto): Promise<AuthTokenResponseDto> {
    return this.authService.login(dto);
  }

  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Get the authenticated account' })
  @ApiOkResponse({
    description: 'Authenticated account details returned.',
    type: AccountResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: 'The access token is missing, invalid, or expired.',
  })
  @UseGuards(JwtAuthGuard)
  @Get('me')
  getMe(@Req() req: AuthenticatedRequest): Promise<AccountResponseDto> {
    return this.authService.getAccount(req.user.sub);
  }
}
