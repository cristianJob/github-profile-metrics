/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Controller, Get, Param, NotFoundException } from '@nestjs/common';
import { GetProfileUseCase } from '../usecases/get-profile.usecase';
import { UsernamePipe } from '../common/pipes/username.pipe';

@Controller('profiles')
export class ProfilesController {
  // ✅ Inyecta el caso de uso en el constructor
  constructor(private readonly getProfileUseCase: GetProfileUseCase) {}

  @Get(':username')
  async get(@Param('username', UsernamePipe) username: string) {
    try {
      const profile = await this.getProfileUseCase.execute({ username });
      return profile;
    } catch (err: any) {
      if (err.status === 404) {
        throw new NotFoundException(`User ${username} not found`);
      }
      throw err;
    }
  }
}
