import { Controller, Get, UseGuards, Req } from '@nestjs/common';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { ApiBearerAuth } from '@nestjs/swagger';

@Controller()
export class AppController {
  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard)
  @Get('protected')
  getProtected(@Req() req: any) {
    return {
      message: 'You are authenticated',
      user: req.user,
    };
  }
}
