import { Test, TestingModule } from '@nestjs/testing';
import { UserRole } from '@prisma/client';
import { AppController } from './app.controller';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('protected', () => {
    it('should return the authenticated user', () => {
      const req = {
        user: {
          sub: '1',
          role: UserRole.ADMIN,
        },
      };

      expect(appController.getProtected(req)).toEqual({
        message: 'You are authenticated',
        user: req.user,
      });
    });
  });
});
