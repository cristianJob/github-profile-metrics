import { IsString, Length, Matches } from 'class-validator';

export class UsernameDto {
  @IsString()
  @Length(1, 39)
  @Matches(/^[a-zA-Z0-9-]+$/)
  username: string;
}
