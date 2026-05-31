import { ApiProperty } from '@nestjs/swagger';
import { UserListItemDto } from './user-list-item.dto';

export class ListUsersResponseDto {
  @ApiProperty({
    type: [UserListItemDto],
  })
  data!: UserListItemDto[];

  @ApiProperty({
    example: 1,
  })
  page!: number;

  @ApiProperty({
    example: 20,
  })
  limit!: number;

  @ApiProperty({
    example: 1,
  })
  total!: number;

  @ApiProperty({
    example: 1,
  })
  totalPages!: number;
}
