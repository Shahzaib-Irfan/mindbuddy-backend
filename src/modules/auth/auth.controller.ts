import { Controller, Post, Body, Get, UseGuards, Request } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from './auth.guard';
import { Public } from './public.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('anonymous')
  async createAnonymousUser() {
    const result = await this.authService.createAnonymousUser();
    return {
      message: 'Anonymous user created successfully',
      ...result,
    };
  }

  @UseGuards(AuthGuard)
  @Post('upgrade')
  async upgradeAnonymousUser(
    @Request() req: any,
    @Body() body: { email: string; name?: string; password?: string },
  ) {
    if (!req.user.anonymousUser) {
      return { message: 'User is already registered' };
    }

    const result = await this.authService.upgradeAnonymousUser(
      req.user.sub,
      body.email,
      body.name,
      body.password,
    );

    return {
      message: 'Anonymous user upgraded successfully',
      ...result,
    };
  }

  @UseGuards(AuthGuard)
  @Get('me')
  async getProfile(@Request() req: any) {
    if (req.user.isAnonymous) {
      return {
        message: 'Anonymous user',
        user: {
          isAnonymous: true,
          anonymousUser: true,
        },
      };
    }

    const user = await this.authService.validateUser(req.user.sub);
    if (!user) {
      throw new Error('User not found');
    }

    return {
      message: 'User profile',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        anonymousUser: user.anonymousUser,
        isAnonymous: false,
      },
    };
  }
}
