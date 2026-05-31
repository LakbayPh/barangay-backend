import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import * as Joi from 'joi';
import { AppController } from './app.controller';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        JWT_SECRET: Joi.string().required(),
        JWT_EXPIRES_IN: Joi.string().required(),
        DATABASE_URL: Joi.string().required(),
        DATA_ENCRYPTION_KEY: Joi.string().base64().required(),
      }),
    }),
    AuthModule,
    UsersModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
