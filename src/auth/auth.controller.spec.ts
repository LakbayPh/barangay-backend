import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';

describe('AuthController', () => {
  let controller: AuthController;
  const authService = {
    login: jest.fn(),
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
});
