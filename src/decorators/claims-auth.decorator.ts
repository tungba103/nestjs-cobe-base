import { JwtAuthGuard, PermissionsGuard } from '@n-guards';
import { UseGuards, applyDecorators } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';

export function AuthClaims() {
  return applyDecorators(
    ApiBearerAuth(),
    UseGuards(JwtAuthGuard, PermissionsGuard),
  );
}
