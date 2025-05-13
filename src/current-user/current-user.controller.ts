import { Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Current User')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('current_user')
export class CurrentUserController {
  constructor(private readonly usersService: UsersService) {}

  /*
   * TODO: Return current user
   */

  @Get()
  show() {
    return 'Add your implementation here.';
  }

  /*
   * TODO: Update current user
   */

  @Patch()
  update() {
    return 'Add your implementation here.';
  }
}
