import {
  Controller,
  Post,
  Body,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { ApiTags } from '@nestjs/swagger';
import { AuthClaims } from '@n-decorators';
import { RefreshTokenDto } from './dto/refresh-token.dto';

@Controller('auth')
@ApiTags('Auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    const user = await this.authService.validateUser(
      loginDto.username,
      loginDto.password,
    );

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const result = await this.authService.login(user);

    return {
      message: 'Login successful',
      status: 200,
      result,
    };
  }

  @Post('refresh')
  async refresh(@Body() body: RefreshTokenDto) {
    const { refreshToken } = body;
    const user = await this.authService.validateRefreshToken(refreshToken);
    return this.authService.login(user);
  }

  @AuthClaims()
  @Post('logout')
  async logout(@Req() req: any) {
    await this.authService.revokeRefreshToken(req.user.id);
    return { message: 'Logged out successfully' };
  }
}
