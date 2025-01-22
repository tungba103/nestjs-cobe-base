import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private prisma: PrismaService,
    private usersService: UsersService,
  ) {}

  async validateUser(username: string, password: string): Promise<any> {
    const user = await this.usersService.findByUsername(username);
    if (user && (await bcrypt.compare(password, user.password))) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: LoginDto) {
    const findUser = await this.usersService.findByUsername(user.username, {
      userRoles: true,
    });

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...result } = findUser;

    const payload = {
      id: findUser.id,
      name: findUser.name,
    };

    const accessToken = this.jwtService.sign(payload, { expiresIn: '1y' });
    const refreshToken = await this.generateRefreshToken(findUser.id);

    return {
      accessToken,
      refreshToken,
      user: result,
    };
  }

  async generateRefreshToken(userId: number) {
    const refreshTokenValue = this.jwtService.sign(
      { sub: userId },
      { expiresIn: '30d' },
    );

    await this.prisma.refreshToken.create({
      data: {
        value: refreshTokenValue,
        userId: userId,
        isActive: true,
      },
    });

    return refreshTokenValue;
  }

  async validateRefreshToken(token: string) {
    const refreshToken = await this.prisma.refreshToken.findFirst({
      where: { value: token },
    });

    if (!refreshToken || !refreshToken.isActive) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const payload = this.jwtService.verify(token);
    const user = await this.usersService.findById(payload.sub);

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return user;
  }

  async revokeRefreshToken(userId: number) {
    await this.prisma.refreshToken.deleteMany({
      where: { userId },
    });
  }
}
