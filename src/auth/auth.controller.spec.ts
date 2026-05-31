import { Test, TestingModule } from '@nestjs/testing';
import { UserRole } from '@prisma/client';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

describe('AuthController', () => {
  let controller: AuthController;
  const authService = {
    register: jest.fn(),
    login: jest.fn(),
    getAccount: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: authService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should delegate registration to AuthService', async () => {
    const dto: RegisterDto = {
      email: 'admin@test.com',
      password: 'password123',
    };

    authService.register.mockResolvedValue({ success: true });

    await expect(controller.register(dto)).resolves.toEqual({
      success: true,
    });
    expect(authService.register).toHaveBeenCalledWith(dto);
  });

  it('should delegate login to AuthService', async () => {
    const dto: LoginDto = {
      email: 'admin@test.com',
      password: '123456',
    };

    authService.login.mockResolvedValue({ access_token: 'jwt-token' });

    await expect(controller.login(dto)).resolves.toEqual({
      access_token: 'jwt-token',
    });
    expect(authService.login).toHaveBeenCalledWith(dto);
  });

  it('should delegate account lookup to AuthService', async () => {
    const req = {
      user: {
        sub: '1',
        role: UserRole.ADMIN,
      },
    } as Parameters<AuthController['getMe']>[0];
    const account = {
      id: '1',
      accountId: 'MTB-00001',
      email: 'admin@test.com',
      role: UserRole.ADMIN,
    };

    authService.getAccount.mockResolvedValue(account);

    await expect(controller.getMe(req)).resolves.toEqual(account);
    expect(authService.getAccount).toHaveBeenCalledWith('1');
  });
});
