import { Test, TestingModule } from '@nestjs/testing';
import { UserRole } from '@prisma/client';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

describe('UsersController', () => {
  let controller: UsersController;
  const usersService = {
    listUsers: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: usersService,
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
  });

  it('should delegate list users to UsersService', async () => {
    const query = {
      page: 1,
      limit: 20,
      role: UserRole.STAFF,
    };
    const response = {
      data: [],
      page: 1,
      limit: 20,
      total: 0,
      totalPages: 0,
    };

    usersService.listUsers.mockResolvedValue(response);

    await expect(controller.listUsers(query)).resolves.toEqual(response);
    expect(usersService.listUsers).toHaveBeenCalledWith(query);
  });
});
