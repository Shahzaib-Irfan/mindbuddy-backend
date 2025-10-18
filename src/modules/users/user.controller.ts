import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { UsersService } from './user.service';
import { AuthGuard } from '../auth/auth.guard';
import { Public } from '../auth/public.decorator';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Public()
  @UseGuards(AuthGuard)
  @Get()
  async findAll(@Request() req: any) {
    const users = await this.usersService.findAll();
    
    return {
      message: 'Users retrieved successfully',
      userType: req.user.isAnonymous ? 'anonymous' : 'authenticated',
      currentUser: req.user,
      users: users,
    };
  }

  @UseGuards(AuthGuard)
  @Get('profile')
  async getProfile(@Request() req: any) {
    if (req.user.isAnonymous) {
      return {
        message: 'Anonymous user profile',
        user: {
          isAnonymous: true,
          anonymousUser: true,
        },
      };
    }

    const user = await this.usersService.findById(req.user.sub);
    return {
      message: 'User profile',
      user: user,
    };
  }
}