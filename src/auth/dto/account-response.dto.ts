import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';

export class AccountResponseDto {
  @ApiProperty({
    example: 'clx123abc0000abcd1234efgh',
  })
  id!: string;

  @ApiProperty({
    example: 'MTB-00001',
  })
  accountId!: string;

  @ApiProperty({
    example: 'admin@test.com',
  })
  email!: string;

  @ApiProperty({
    enum: UserRole,
    example: UserRole.ADMIN,
  })
  role!: UserRole;

  @ApiProperty({
    example: '2026-05-31T04:31:09.000Z',
    format: 'date-time',
  })
  createdAt!: Date;

  @ApiProperty({
    example: '2026-05-31T04:31:09.000Z',
    format: 'date-time',
  })
  updatedAt!: Date;
}
